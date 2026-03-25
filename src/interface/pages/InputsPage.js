import { useState } from "react";
import "../../styles/InputsPage.sass";
import Page from "../Page"

const toDisplayNumber = (value) =>
{
    if (value === null || value === undefined)
    {
        return "";
    }

    return String(value);
}

const parseNumber = (value) =>
{
    if (value === "")
    {
        return 0;
    }

    return Number(value);
}

const toDisplayPercent = (value) =>
{
    if (value === null || value === undefined)
    {
        return "";
    }

    return String(value * 100);
}

const parsePercent = (value) =>
{
    if (value === "")
    {
        return 0;
    }

    return Number(value.replace("%", "").trim()) / 100;
}

const parseText = (value) => value;

const formatCurrency = (value) =>
{
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

const Field = ({
    ariaLabel,
    inputMode,
    label,
    onChange,
    parseValue = parseNumber,
    step = "0.01",
    type = "number",
    toDisplayValue = toDisplayNumber,
    value,
}) =>
{
    return <label className="InputsField">
        <span>{label}</span>
        <div className="InputsField__inputWrap">
            <input
                aria-label={ariaLabel}
                inputMode={inputMode}
                onChange={(event) => onChange(parseValue(event.target.value))}
                step={step}
                type={type}
                value={toDisplayValue(value)}
            />
        </div>
    </label>
}

const InputsSection = ({ children, hint, title }) =>
{
    return <section className="InputsSection">
        <h2>{title}</h2>
        {hint && <p className="InputsSection__hint">{hint}</p>}
        {children}
    </section>
}

const InputsPage = ({ planInput, setPlanInput }) =>
{
    const [selectedInputsView, setSelectedInputsView] = useState("Expenses");
    const [fixedExpensesExpanded, setFixedExpensesExpanded] = useState(true);
    const [variableExpensesExpanded, setVariableExpensesExpanded] = useState(true);
    const [irregularExpensesExpanded, setIrregularExpensesExpanded] = useState(true);
    const restaurantSource = planInput.incomeSources[0];
    const fixedExpensesTotal = planInput.expenses.fixedLineItems.reduce(
        (total, item) => total + item.monthlyAmount,
        0
    );
    const variableExpenseLowTotal = planInput.expenses.variableLineItems.reduce(
        (total, item) => total + item.monthlyRange.low,
        0
    );
    const variableExpenseHighTotal = planInput.expenses.variableLineItems.reduce(
        (total, item) => total + item.monthlyRange.high,
        0
    );
    const irregularExpensesNormalizedTotal = planInput.expenses.irregularLineItems.reduce(
        (total, item) => total + (item.amount / item.everyMonths),
        0
    );

    const updatePlanInput = (updater) =>
    {
        setPlanInput((current) => updater(current));
    }

    const updateFixedExpense = (itemId, monthlyAmount) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                fixedLineItems: current.expenses.fixedLineItems.map((item) =>
                    item.id === itemId ? { ...item, monthlyAmount } : item
                ),
            },
        }));
    }

    const updateFixedExpenseName = (itemId, label) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                fixedLineItems: current.expenses.fixedLineItems.map((item) =>
                    item.id === itemId ? { ...item, label } : item
                ),
            },
        }));
    }

    const addFixedExpense = () =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                fixedLineItems: [
                    ...current.expenses.fixedLineItems,
                    {
                        id: `fixed-${Date.now()}`,
                        label: "New Line Item",
                        monthlyAmount: 0,
                    },
                ],
            },
        }));
    }

    const removeFixedExpense = (itemId) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                fixedLineItems: current.expenses.fixedLineItems.filter((item) => item.id !== itemId),
            },
        }));
    }

    const updateVariableExpense = (itemId, rangeKey, amount) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                variableLineItems: current.expenses.variableLineItems.map((item) =>
                    item.id === itemId
                        ? {
                            ...item,
                            monthlyRange: {
                                ...item.monthlyRange,
                                [rangeKey]: amount,
                            },
                        }
                        : item
                ),
            },
        }));
    }

    const updateVariableExpenseName = (itemId, label) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                variableLineItems: current.expenses.variableLineItems.map((item) =>
                    item.id === itemId ? { ...item, label } : item
                ),
            },
        }));
    }

    const addVariableExpense = () =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                variableLineItems: [
                    ...current.expenses.variableLineItems,
                    {
                        id: `variable-${Date.now()}`,
                        label: "New Variable Expense",
                        monthlyRange: {
                            low: 0,
                            high: 0,
                        },
                    },
                ],
            },
        }));
    }

    const removeVariableExpense = (itemId) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                variableLineItems: current.expenses.variableLineItems.filter((item) => item.id !== itemId),
            },
        }));
    }

    const updateIrregularExpense = (itemId, key, value) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                irregularLineItems: current.expenses.irregularLineItems.map((item) =>
                    item.id === itemId ? { ...item, [key]: value } : item
                ),
            },
        }));
    }

    const updateIrregularExpenseName = (itemId, label) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                irregularLineItems: current.expenses.irregularLineItems.map((item) =>
                    item.id === itemId ? { ...item, label } : item
                ),
            },
        }));
    }

    const addIrregularExpense = () =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                irregularLineItems: [
                    ...current.expenses.irregularLineItems,
                    {
                        id: `irregular-${Date.now()}`,
                        label: "New Irregular Expense",
                        amount: 0,
                        everyMonths: 1,
                    },
                ],
            },
        }));
    }

    const removeIrregularExpense = (itemId) =>
    {
        updatePlanInput((current) => ({
            ...current,
            expenses: {
                ...current.expenses,
                irregularLineItems: current.expenses.irregularLineItems.filter((item) => item.id !== itemId),
            },
        }));
    }

    const updateGoal = (key, value) =>
    {
        updatePlanInput((current) => ({
            ...current,
            goals: {
                ...current.goals,
                [key]: value,
            },
        }));
    }

    const updateWorkProfile = (profileKey, key, value) =>
    {
        updatePlanInput((current) => ({
            ...current,
            workProfiles: {
                ...current.workProfiles,
                [profileKey]: {
                    ...current.workProfiles[profileKey],
                    [key]: value,
                },
            },
        }));
    }

    const updateConstraint = (key, value) =>
    {
        updatePlanInput((current) => ({
            ...current,
            constraints: {
                ...current.constraints,
                [key]: value,
            },
        }));
    }

    const updateRestaurantField = (key, value) =>
    {
        updatePlanInput((current) => ({
            ...current,
            incomeSources: current.incomeSources.map((source) =>
                source.id === restaurantSource.id ? { ...source, [key]: value } : source
            ),
        }));
    }

    const updateRestaurantAssumption = (assumptionKey, scenarioKey, value) =>
    {
        updatePlanInput((current) => ({
            ...current,
            incomeSources: current.incomeSources.map((source) =>
                source.id === restaurantSource.id
                    ? {
                        ...source,
                        assumptions: {
                            ...source.assumptions,
                            [assumptionKey]: {
                                ...source.assumptions[assumptionKey],
                                [scenarioKey]: value,
                            },
                        },
                    }
                    : source
            ),
        }));
    }

    return <Page>
        <div className="InputsPage">
            <header className="InputsPage__header">
                <h1>Inputs</h1>
                <p>
                    Define what your month needs to cover, then define how you
                    actually work and earn. The analytics page responds directly
                    to these raw inputs.
                </p>
            </header>

            <div className="InputsPage__viewToggle">
                <button
                    className={`InputsPage__viewButton ${selectedInputsView === "Expenses" ? "selected" : ""}`}
                    onClick={() => setSelectedInputsView("Expenses")}
                    type="button"
                >
                    Expenses
                </button>
                <button
                    className={`InputsPage__viewButton ${selectedInputsView === "Income" ? "selected" : ""}`}
                    onClick={() => setSelectedInputsView("Income")}
                    type="button"
                >
                    Income
                </button>
            </div>

            {selectedInputsView === "Expenses" && (
                <div className="InputsPage__grid">
                    <section className="InputsSection">
                    <button
                        className="InputsSection__toggle"
                        onClick={() => setFixedExpensesExpanded((current) => !current)}
                        type="button"
                    >
                        <div>
                            <h2>Fixed Monthly Expenses</h2>
                            <p className="InputsSection__hint">
                                These are direct monthly line items. Their total is derived later.
                            </p>
                        </div>
                        <div className="InputsSection__summary">
                            <strong>{formatCurrency(fixedExpensesTotal)}</strong>
                            <span>{fixedExpensesExpanded ? "Collapse" : "Expand"}</span>
                        </div>
                    </button>

                    {fixedExpensesExpanded && (
                        <div className="InputsLineItems">
                            {planInput.expenses.fixedLineItems.map((item) => (
                                <div className="InputsLineItem" key={item.id}>
                                    <Field
                                        ariaLabel={`${item.label} Name`}
                                        label="Name"
                                        onChange={(value) => updateFixedExpenseName(item.id, value)}
                                        parseValue={parseText}
                                        type="text"
                                        value={item.label}
                                    />
                                    <Field
                                        ariaLabel={`${item.label} Monthly Amount`}
                                        label="Monthly Amount"
                                        onChange={(value) => updateFixedExpense(item.id, value)}
                                        value={item.monthlyAmount}
                                    />
                                    <button
                                        className="InputsLineItem__remove"
                                        onClick={() => removeFixedExpense(item.id)}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button
                                className="InputsLineItems__add"
                                onClick={addFixedExpense}
                                type="button"
                            >
                                Add Fixed Expense
                            </button>
                        </div>
                    )}
                    </section>

                    <section className="InputsSection">
                    <button
                        className="InputsSection__toggle"
                        onClick={() => setVariableExpensesExpanded((current) => !current)}
                        type="button"
                    >
                        <div>
                            <h2>Variable Expenses</h2>
                            <p className="InputsSection__hint">
                                Enter a low and high monthly range. The expected case is derived automatically as the midpoint.
                            </p>
                        </div>
                        <div className="InputsSection__summary">
                            <strong>{formatCurrency(variableExpenseLowTotal)} - {formatCurrency(variableExpenseHighTotal)}</strong>
                            <span>{variableExpensesExpanded ? "Collapse" : "Expand"}</span>
                        </div>
                    </button>

                    {variableExpensesExpanded && (
                        <div className="InputsLineItems">
                            {planInput.expenses.variableLineItems.map((item) => (
                                <div className="InputsLineItem" key={item.id}>
                                    <Field
                                        ariaLabel={`${item.label} Name`}
                                        label="Name"
                                        onChange={(value) => updateVariableExpenseName(item.id, value)}
                                        parseValue={parseText}
                                        type="text"
                                        value={item.label}
                                    />
                                    <Field
                                        ariaLabel={`${item.label} Low Monthly Amount`}
                                        label="Low"
                                        onChange={(value) => updateVariableExpense(item.id, "low", value)}
                                        value={item.monthlyRange.low}
                                    />
                                    <Field
                                        ariaLabel={`${item.label} High Monthly Amount`}
                                        label="High"
                                        onChange={(value) => updateVariableExpense(item.id, "high", value)}
                                        value={item.monthlyRange.high}
                                    />
                                    <button
                                        className="InputsLineItem__remove"
                                        onClick={() => removeVariableExpense(item.id)}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button
                                className="InputsLineItems__add"
                                onClick={addVariableExpense}
                                type="button"
                            >
                                Add Variable Expense
                            </button>
                        </div>
                    )}
                    </section>

                    <section className="InputsSection">
                    <button
                        className="InputsSection__toggle"
                        onClick={() => setIrregularExpensesExpanded((current) => !current)}
                        type="button"
                    >
                        <div>
                            <h2>Irregular Expenses</h2>
                            <p className="InputsSection__hint">
                                Enter the actual amount and cadence. The monthly normalized value is derived automatically.
                            </p>
                        </div>
                        <div className="InputsSection__summary">
                            <strong>{formatCurrency(irregularExpensesNormalizedTotal)}</strong>
                            <span>{irregularExpensesExpanded ? "Collapse" : "Expand"}</span>
                        </div>
                    </button>

                    {irregularExpensesExpanded && (
                        <div className="InputsLineItems">
                            {planInput.expenses.irregularLineItems.map((item) => (
                                <div className="InputsLineItem" key={item.id}>
                                    <Field
                                        ariaLabel={`${item.label} Name`}
                                        label="Name"
                                        onChange={(value) => updateIrregularExpenseName(item.id, value)}
                                        parseValue={parseText}
                                        type="text"
                                        value={item.label}
                                    />
                                    <Field
                                        ariaLabel={`${item.label} Amount`}
                                        label="Amount"
                                        onChange={(value) => updateIrregularExpense(item.id, "amount", value)}
                                        value={item.amount}
                                    />
                                    <Field
                                        ariaLabel={`${item.label} Every N Months`}
                                        label="Utilities Every N Months"
                                        onChange={(value) => updateIrregularExpense(item.id, "everyMonths", value)}
                                        step="1"
                                        value={item.everyMonths}
                                    />
                                    <button
                                        className="InputsLineItem__remove"
                                        onClick={() => removeIrregularExpense(item.id)}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button
                                className="InputsLineItems__add"
                                onClick={addIrregularExpense}
                                type="button"
                            >
                                Add Irregular Expense
                            </button>
                        </div>
                    )}
                    </section>

                    <InputsSection
                        hint="For now goals are modeled as percentages of income. We can later support fixed monthly target amounts too."
                        title="Goals"
                    >
                        <div className="InputsFieldGrid">
                            <Field
                                inputMode="decimal"
                                label="Savings Rate"
                                onChange={(value) => updateGoal("savingsRate", value)}
                                parseValue={parsePercent}
                                type="text"
                                value={planInput.goals.savingsRate}
                                toDisplayValue={(value) => `${toDisplayPercent(value)}%`}
                            />
                            <Field
                                inputMode="decimal"
                                label="Investing Rate"
                                onChange={(value) => updateGoal("investingRate", value)}
                                parseValue={parsePercent}
                                type="text"
                                value={planInput.goals.investingRate}
                                toDisplayValue={(value) => `${toDisplayPercent(value)}%`}
                            />
                        </div>
                    </InputsSection>
                </div>
            )}

            {selectedInputsView === "Income" && (
                <div className="InputsPage__grid">
                    <InputsSection
                        hint="Work profiles represent how much you choose to work, separate from how well those shifts pay."
                        title="Work Profiles"
                    >
                        <div className="InputsFieldGrid">
                            {Object.entries(planInput.workProfiles).map(([profileKey, profile]) => (
                                <div className="InputsFieldGrid InputsField--full" key={profileKey}>
                                    <Field
                                        label={`${profileKey} Shifts / Week`}
                                        onChange={(value) => updateWorkProfile(profileKey, "shiftsPerWeek", value)}
                                        value={profile.shiftsPerWeek}
                                    />
                                    <Field
                                        label={`${profileKey} Hours / Shift`}
                                        onChange={(value) => updateWorkProfile(profileKey, "workedHoursPerShift", value)}
                                        value={profile.workedHoursPerShift}
                                    />
                                </div>
                            ))}
                        </div>
                    </InputsSection>

                    <InputsSection
                        hint="This keeps the current model honest about feasibility without introducing full scheduling logic yet."
                        title="Constraints"
                    >
                        <div className="InputsFieldGrid">
                            <Field
                                label="Max Worked Hours / Week"
                                onChange={(value) => updateConstraint("maxWorkedHoursPerWeek", value)}
                                value={planInput.constraints.maxWorkedHoursPerWeek}
                            />
                        </div>
                    </InputsSection>

                    <InputsSection
                        hint="These are the restaurant pay assumptions currently feeding the analysis matrix."
                        title="Restaurant Income"
                    >
                        <div className="InputsFieldGrid">
                            <Field
                                label="Base Hourly Rate"
                                onChange={(value) => updateRestaurantField("baseHourlyRate", value)}
                                value={restaurantSource.baseHourlyRate}
                            />
                            <Field
                                label="Meal Violations / Shift Expected"
                                onChange={(value) => updateRestaurantAssumption("mealViolationsPerShift", "expected", value)}
                                value={restaurantSource.assumptions.mealViolationsPerShift.expected}
                            />
                            <Field
                                label="Meal Violations / Shift Conservative"
                                onChange={(value) => updateRestaurantAssumption("mealViolationsPerShift", "conservative", value)}
                                value={restaurantSource.assumptions.mealViolationsPerShift.conservative}
                            />
                            <Field
                                label="Meal Violations / Shift Strong"
                                onChange={(value) => updateRestaurantAssumption("mealViolationsPerShift", "strong", value)}
                                value={restaurantSource.assumptions.mealViolationsPerShift.strong}
                            />
                            <Field
                                label="Serving Share Expected"
                                onChange={(value) => updateRestaurantAssumption("servingShare", "expected", value)}
                                value={restaurantSource.assumptions.servingShare.expected}
                            />
                            <Field
                                label="Serving Share Conservative"
                                onChange={(value) => updateRestaurantAssumption("servingShare", "conservative", value)}
                                value={restaurantSource.assumptions.servingShare.conservative}
                            />
                            <Field
                                label="Serving Share Strong"
                                onChange={(value) => updateRestaurantAssumption("servingShare", "strong", value)}
                                value={restaurantSource.assumptions.servingShare.strong}
                            />
                            <Field
                                label="Server Hourly Expected"
                                onChange={(value) => updateRestaurantAssumption("serverHourly", "expected", value)}
                                value={restaurantSource.assumptions.serverHourly.expected}
                            />
                            <Field
                                label="Server Hourly Conservative"
                                onChange={(value) => updateRestaurantAssumption("serverHourly", "conservative", value)}
                                value={restaurantSource.assumptions.serverHourly.conservative}
                            />
                            <Field
                                label="Server Hourly Strong"
                                onChange={(value) => updateRestaurantAssumption("serverHourly", "strong", value)}
                                value={restaurantSource.assumptions.serverHourly.strong}
                            />
                        </div>
                    </InputsSection>
                </div>
            )}

            <div className="InputsPage__footer">
                This is the first pass of the inputs page: a direct editing surface
                for the current domain model. We can improve labels, grouping, and
                add richer controls once the product flow feels right.
            </div>
        </div>
    </Page>
}

export default InputsPage
