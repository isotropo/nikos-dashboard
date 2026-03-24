import {
  EXPENSE_SCENARIOS,
  INCOME_SCENARIOS,
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

const getFixedMonthlyExpenses = (planInput) =>
{
    return sum(
        planInput.expenses.fixedLineItems.map((item) => item.monthlyAmount)
    );
}

const getIrregularMonthlyExpenses = (planInput) =>
{
    return sum(
        planInput.expenses.irregularLineItems.map((item) => item.amount / item.everyMonths)
    );
}

const getVariableMonthlyExpenses = (planInput, expenseScenario) =>
{
    return sum(
        planInput.expenses.variableLineItems.map((item) =>
            getScenarioValue(item.monthlyAmount, expenseScenario)
        )
    );
}

const getMonthlyExpenses = (planInput, expenseScenario) =>
{
    return getFixedMonthlyExpenses(planInput) +
        getIrregularMonthlyExpenses(planInput) +
        getVariableMonthlyExpenses(planInput, expenseScenario);
}

const getRequiredIncome = (monthlyExpenses, goals) =>
{
    const keepRate = 1 - goals.savingsRate - goals.investingRate;

    if (keepRate <= 0)
    {
        return Infinity;
    }

    return monthlyExpenses / keepRate;
}

const getRestaurantIncome = (source, incomeScenario) =>
{
    const shiftsPerMonth = source.shiftsPerWeek * WEEKS_PER_MONTH;
    const workedHoursPerMonth = shiftsPerMonth * source.workedHoursPerShift;
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

const getCurrentWorkProfile = (planInput, incomeScenario) =>
{
    return planInput.incomeSources.reduce((totals, source) =>
    {
        switch (source.type)
        {
            case "restaurant":
            {
                const income = getRestaurantIncome(source, incomeScenario);

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

export const buildIncomeGapMatrix = (planInput) =>
{
    const cells = [];
    const maxWorkedHoursPerMonth = planInput.constraints.maxWorkedHoursPerWeek * WEEKS_PER_MONTH;

    EXPENSE_SCENARIOS.forEach((expenseScenario) =>
    {
        INCOME_SCENARIOS.forEach((incomeScenario) =>
        {
            const monthlyExpenses = getMonthlyExpenses(planInput, expenseScenario);
            const requiredIncome = getRequiredIncome(monthlyExpenses, planInput.goals);
            const workProfile = getCurrentWorkProfile(planInput, incomeScenario);
            const currentIncome = workProfile.currentIncome;
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
        cells,
    };
}
