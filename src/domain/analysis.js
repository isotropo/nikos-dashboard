import {
  EXPENSE_SCENARIOS,
  INCOME_SCENARIOS,
  WORK_PROFILES,
} from "./planModel";

const WEEKS_PER_MONTH = 4.33;

const getScenarioValue = (varianceValue, scenario) =>
{
    if (scenario === "expected")
    {
        return varianceValue.expected;
    }

    return varianceValue[scenario] ?? varianceValue.expected;
}

const sum = (values) =>
{
    return values.reduce((total, value) => total + value, 0);
}

const getRangeMidpoint = (range) =>
{
    return (range.low + range.high) / 2;
}

const getEnabledItems = (items) =>
{
    return items.filter((item) => item.isEnabled !== false);
}

const getFixedMonthlyExpenses = (planInput) =>
{
    return sum(
        getEnabledItems(planInput.expenses.fixedLineItems).map((item) => item.monthlyAmount)
    );
}

const getIrregularMonthlyExpenses = (planInput) =>
{
    return sum(
        getEnabledItems(planInput.expenses.irregularLineItems).map(
            (item) => item.amount / item.everyMonths
        )
    );
}

const getVariableMonthlyExpenses = (planInput, expenseScenario) =>
{
    return sum(
        getEnabledItems(planInput.expenses.variableLineItems).map((item) =>
        {
            switch (expenseScenario)
            {
                case "low":
                    return item.monthlyRange.low;
                case "high":
                    return item.monthlyRange.high;
                default:
                    return getRangeMidpoint(item.monthlyRange);
            }
        })
    );
}

const getMonthlyExpenses = (planInput, expenseScenario) =>
{
    return getFixedMonthlyExpenses(planInput) +
        getIrregularMonthlyExpenses(planInput) +
        getVariableMonthlyExpenses(planInput, expenseScenario);
}

const getRequiredIncome = (monthlyExpenses, currentIncome, goals) =>
{
    const totalGoalRate = goals.savingsRate + goals.investingRate;

    if (goals.rateBasis === "actual_income")
    {
        return monthlyExpenses + (currentIncome * totalGoalRate);
    }

    const keepRate = 1 - totalGoalRate;

    if (keepRate <= 0)
    {
        return Infinity;
    }

    return monthlyExpenses / keepRate;
}

const getRestaurantIncome = (source, incomeScenario, workProfile) =>
{
    const shiftsPerMonth = workProfile.shiftsPerWeek * WEEKS_PER_MONTH;
    const workedHoursPerMonth = shiftsPerMonth * workProfile.workedHoursPerShift;
    const mealViolationHoursPerMonth = shiftsPerMonth *
        getScenarioValue(source.assumptions.mealViolationsPerShift, incomeScenario);
    const servingShare = getScenarioValue(source.assumptions.servingShare, incomeScenario);
    const serverHourly = getScenarioValue(source.assumptions.serverHourly, incomeScenario);
    const blendedHourly = (servingShare * serverHourly) +
        ((1 - servingShare) * source.baseHourlyRate);

    return {
        income: (workedHoursPerMonth * blendedHourly) +
            (mealViolationHoursPerMonth * source.baseHourlyRate),
        workedHoursPerMonth,
        blendedHourly,
    };
}

const getCurrentWorkProfile = (planInput, incomeScenario, selectedWorkProfile) =>
{
    const workProfile = planInput.workProfiles[selectedWorkProfile];

    return planInput.incomeSources.reduce((totals, source) =>
    {
        switch (source.type)
        {
            case "restaurant":
            {
                const income = getRestaurantIncome(source, incomeScenario, workProfile);

                return {
                    currentIncome: totals.currentIncome + income.income,
                    currentWorkedHoursPerMonth: totals.currentWorkedHoursPerMonth + income.workedHoursPerMonth,
                    weightedHourlyTotal: totals.weightedHourlyTotal +
                        (income.blendedHourly * income.workedHoursPerMonth),
                };
            }
            default:
                return totals;
        }
    }, {
        currentIncome: 0,
        currentWorkedHoursPerMonth: 0,
        weightedHourlyTotal: 0,
    });
}

const getGapHours = (gap, currentWorkedHoursPerMonth, weightedHourlyTotal) =>
{
    if (currentWorkedHoursPerMonth <= 0 || weightedHourlyTotal <= 0)
    {
        return Infinity;
    }

    const effectiveWorkedHourly = weightedHourlyTotal / currentWorkedHoursPerMonth;

    return gap / effectiveWorkedHourly;
}

export const buildIncomeGapMatrix = (
    planInput,
    selectedWorkProfile = WORK_PROFILES[1]
) =>
{
    const cells = [];
    const maxWorkedHoursPerMonth = planInput.constraints.maxWorkedHoursPerWeek * WEEKS_PER_MONTH;

    EXPENSE_SCENARIOS.forEach((expenseScenario) =>
    {
        INCOME_SCENARIOS.forEach((incomeScenario) =>
        {
            const monthlyExpenses = getMonthlyExpenses(planInput, expenseScenario);
            const workProfile = getCurrentWorkProfile(
                planInput,
                incomeScenario,
                selectedWorkProfile
            );
            const currentIncome = workProfile.currentIncome;
            const requiredIncome = getRequiredIncome(
                monthlyExpenses,
                currentIncome,
                planInput.goals
            );
            const gap = requiredIncome - currentIncome;
            const remainingWorkedHoursPerMonth = maxWorkedHoursPerMonth -
                workProfile.currentWorkedHoursPerMonth;
            const gapHours = getGapHours(
                gap,
                workProfile.currentWorkedHoursPerMonth,
                workProfile.weightedHourlyTotal
            );

            cells.push({
                id: `${expenseScenario}-${incomeScenario}`,
                expenseScenario,
                incomeScenario,
                workProfile: selectedWorkProfile,
                monthlyExpenses,
                requiredIncome,
                currentIncome,
                gap,
                currentWorkedHoursPerMonth: workProfile.currentWorkedHoursPerMonth,
                maxWorkedHoursPerMonth,
                remainingWorkedHoursPerMonth,
                gapHours,
                feasibility: gap <= 0
                    ? "surplus"
                    : gapHours <= remainingWorkedHoursPerMonth
                        ? "feasible"
                        : "infeasible",
                status: gap > 0 ? "gap" : "surplus",
            });
        });
    });

    return {
        axes: {
            expenseScenarios: EXPENSE_SCENARIOS,
            incomeScenarios: INCOME_SCENARIOS,
        },
        workProfile: selectedWorkProfile,
        cells,
    };
}
