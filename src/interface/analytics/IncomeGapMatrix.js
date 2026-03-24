import "../../styles/IncomeGapMatrix.sass";

const INCOME_LABELS = {
    conservative: "Conservative Income",
    expected: "Expected Income",
    strong: "Strong Income",
};

const EXPENSE_LABELS = {
    low: "Low Expenses",
    expected: "Expected Expenses",
    high: "High Expenses",
};

const WORK_PROFILE_LABELS = {
    conservative: "Conservative Work",
    expected: "Expected Work",
    max: "Max Work",
};

const formatCurrency = (value) =>
{
    if (!Number.isFinite(value))
    {
        return "Not possible";
    }

    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

const formatGapLabel = (cell) =>
{
    return cell.status === "surplus" ? "Surplus" : "Gap";
}

const formatHours = (value) =>
{
    if (!Number.isFinite(value))
    {
        return "Not possible";
    }

    return `${Math.abs(value).toFixed(1)} hrs`;
}

const formatHoursLabel = (cell) =>
{
    return cell.status === "surplus" ? "Hours Surplus" : "Hours Gap";
}

const formatFeasibility = (cell) =>
{
    switch (cell.feasibility)
    {
        case "surplus":
            return "Already covered";
        case "feasible":
            return "Within 40 hr/week cap";
        default:
            return "Over 40 hr/week cap";
    }
}

const WorkProfileSelector = ({ onSelectWorkProfile, selectedWorkProfile }) =>
{
    return <div className="WorkProfileSelector">
        {Object.entries(WORK_PROFILE_LABELS).map(([profile, label]) =>
            <button
                className={`WorkProfileSelector__button ${selectedWorkProfile === profile ? "selected" : ""}`}
                key={profile}
                onClick={() => onSelectWorkProfile(profile)}
                type="button"
            >
                {label}
            </button>
        )}
    </div>
}

const getCardTone = (cell) =>
{
    if (cell.status === "surplus")
    {
        return "positive";
    }

    if (cell.gap > 1000)
    {
        return "urgent";
    }

    return "caution";
}

const IncomeGapScenarioCard = ({ cell }) =>
{
    const gapValue = Math.abs(cell.gap);

    return <section className={`IncomeGapScenarioCard ${getCardTone(cell)}`}>
        <div className="IncomeGapScenarioCard__eyebrow">
            {EXPENSE_LABELS[cell.expenseScenario]} x {INCOME_LABELS[cell.incomeScenario]}
        </div>
        <div className="IncomeGapScenarioCard__row">
            <span>Monthly Expenses</span>
            <strong>{formatCurrency(cell.monthlyExpenses)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__row">
            <span>Required Income</span>
            <strong>{formatCurrency(cell.requiredIncome)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__row">
            <span>Current Income</span>
            <strong>{formatCurrency(cell.currentIncome)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__row">
            <span>Worked Hours</span>
            <strong>{formatHours(cell.currentWorkedHoursPerMonth)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__row">
            <span>Hours Capacity Left</span>
            <strong>{formatHours(cell.remainingWorkedHoursPerMonth)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__row">
            <span>{formatHoursLabel(cell)}</span>
            <strong>{formatHours(cell.gapHours)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__row IncomeGapScenarioCard__row--emphasis">
            <span>{formatGapLabel(cell)}</span>
            <strong>{formatCurrency(gapValue)}</strong>
        </div>
        <div className="IncomeGapScenarioCard__footnote">
            {formatFeasibility(cell)}
        </div>
    </section>
}

const findCell = (matrix, expenseScenario, incomeScenario) =>
{
    return matrix.cells.find((cell) =>
        cell.expenseScenario === expenseScenario &&
        cell.incomeScenario === incomeScenario
    );
}

const MobileIncomeCarousel = ({ matrix }) =>
{
    return <div className="IncomeGapMatrix__mobile">
        <div className="IncomeGapMatrix__mobileHint">
            Swipe sideways to compare income scenarios.
        </div>

        <div className="IncomeGapMatrix__mobileSlides">
            {matrix.axes.incomeScenarios.map((incomeScenario) =>
                <section
                    className="IncomeGapMatrix__mobileSlide"
                    key={incomeScenario}
                >
                    <header className="IncomeGapMatrix__mobileHeader">
                        {INCOME_LABELS[incomeScenario]}
                    </header>

                    <div className="IncomeGapMatrix__mobileCards">
                        {matrix.axes.expenseScenarios.map((expenseScenario) =>
                            <IncomeGapScenarioCard
                                cell={findCell(matrix, expenseScenario, incomeScenario)}
                                key={`${incomeScenario}-${expenseScenario}`}
                            />
                        )}
                    </div>
                </section>
            )}
        </div>
    </div>
}

const IncomeGapMatrix = ({
    matrix,
    onSelectWorkProfile,
    selectedWorkProfile,
}) =>
{
    return <section className="IncomeGapMatrix">
        <header className="IncomeGapMatrix__header">
            <h1>Income Gap Matrix</h1>
            <p>
                Compare nine combinations of expense pressure and income strength.
                The center card is the expected baseline, and the surrounding cards
                show how risk shifts around it. Work behavior is selected
                separately so you can see how the same expense and pay conditions
                change when you choose a different shift volume.
            </p>
        </header>

        <div className="IncomeGapMatrix__toolbar">
            <div className="IncomeGapMatrix__toolbarLabel">
                Work Profile: {WORK_PROFILE_LABELS[selectedWorkProfile]}
            </div>
            <WorkProfileSelector
                onSelectWorkProfile={onSelectWorkProfile}
                selectedWorkProfile={selectedWorkProfile}
            />
        </div>

        <div className="IncomeGapMatrix__grid">
            <div className="IncomeGapMatrix__corner">Expense vs Income</div>
            {matrix.axes.incomeScenarios.map((incomeScenario) =>
                <div
                    className="IncomeGapMatrix__columnHeader"
                    key={incomeScenario}
                >
                    {INCOME_LABELS[incomeScenario]}
                </div>
            )}

            {matrix.axes.expenseScenarios.map((expenseScenario) => [
                <div
                    className="IncomeGapMatrix__rowHeader"
                    key={`${expenseScenario}-label`}
                >
                    {EXPENSE_LABELS[expenseScenario]}
                </div>,
                ...matrix.axes.incomeScenarios.map((incomeScenario) =>
                    <IncomeGapScenarioCard
                        cell={findCell(matrix, expenseScenario, incomeScenario)}
                        key={`${expenseScenario}-${incomeScenario}`}
                    />
                ),
            ])}
        </div>

        <MobileIncomeCarousel matrix={matrix} />
    </section>
}

export default IncomeGapMatrix
