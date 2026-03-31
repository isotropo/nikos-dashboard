export const EXPENSE_SCENARIOS = ["low", "expected", "high"];
export const INCOME_SCENARIOS = ["conservative", "expected", "strong"];
export const WORK_PROFILES = ["conservative", "expected", "max"];
export const GOAL_RATE_BASES = ["required_income", "actual_income"];
export const SERVER_HOURLY_EXPECTED_MODES = ["derived", "manual"];

/**
 * A value that can stay fixed for now, but later expose scenario-specific
 * values without changing the surrounding data model.
 *
 * @typedef {Object} VarianceValue
 * @property {number} expected
 * @property {number | null} low
 * @property {number | null} high
 * @property {number | null} conservative
 * @property {number | null} strong
 */

/**
 * The visible bounds for the future server-hourly slider UI.
 *
 * `min` should normally mirror `baseHourlyRate`, while `max` stays user-editable
 * so the slider can reflect a realistic upper bound for that job.
 *
 * @typedef {Object} SliderRange
 * @property {number} min
 * @property {number} max
 */

/**
 * The future derived-or-manual state for the expected server-hourly marker.
 *
 * When `mode` is `derived`, the effective expected value should be the midpoint
 * of `conservative` and `strong`. When `mode` is `manual`, `manualValue` is the
 * user-authored expected value inside that same range.
 *
 * @typedef {Object} DerivedOrManualValue
 * @property {"derived" | "manual"} mode
 * @property {number | null} manualValue
 */

/**
 * Planned future contract for the `serverHourly` assumption once the slider UI
 * replaces the current three-number editor.
 *
 * This is intentionally defined now so the eventual migration has an explicit
 * target shape before the runtime data model changes.
 *
 * @typedef {Object} ServerHourlySliderAssumption
 * @property {SliderRange} range
 * @property {number} conservative
 * @property {DerivedOrManualValue} expected
 * @property {number} strong
 */

/**
 * A fixed expense entered directly by the user. This is a line item, not a
 * pre-summed monthly total.
 *
 * @typedef {Object} FixedExpenseLineItem
 * @property {string} id
 * @property {string} label
 * @property {number} monthlyAmount
 * @property {boolean} isEnabled
 */

/**
 * A variable monthly expense entered as a range. The expected value is derived
 * later as the midpoint of that range.
 *
 * @typedef {Object} VariableExpenseLineItem
 * @property {string} id
 * @property {string} label
 * @property {boolean} isEnabled
 * @property {{
 *   low: number,
 *   high: number
 * }} monthlyRange
 */

/**
 * An irregular expense that must be normalized into a monthly value.
 *
 * @typedef {Object} IrregularExpenseLineItem
 * @property {string} id
 * @property {string} label
 * @property {number} amount
 * @property {number} everyMonths
 * @property {boolean} isEnabled
 */

/**
 * Assumptions for a restaurant income source. The scenario-sensitive fields
 * are nested so income uncertainty can vary independently from expenses.
 *
 * @typedef {Object} RestaurantIncomeSource
 * @property {string} id
 * @property {"restaurant"} type
 * @property {string} label
 * @property {number} baseHourlyRate
 * @property {{
 *   mealViolationsPerShift: VarianceValue,
 *   servingShare: VarianceValue,
 *   serverHourly: VarianceValue | ServerHourlySliderAssumption
 * }} assumptions
 */

/**
 * A user behavior profile describing how much work they typically choose to
 * take on at a given job.
 *
 * @typedef {Object} WorkProfile
 * @property {number} shiftsPerWeek
 * @property {number} workedHoursPerShift
 */

/**
 * The raw planning data authored by the user.
 *
 * Derived values like fixed monthly totals, normalized irregular totals,
 * required income, current income, and gap should be computed from this data
 * rather than stored alongside it.
 *
 * @typedef {Object} PlanInput
 * @property {{
 *   fixedLineItems: FixedExpenseLineItem[],
 *   variableLineItems: VariableExpenseLineItem[],
 *   irregularLineItems: IrregularExpenseLineItem[]
 * }} expenses
 * @property {{
 *   savingsRate: number,
 *   investingRate: number,
 *   rateBasis: "required_income" | "actual_income"
 * }} goals
 * @property {{
 *   conservative: WorkProfile,
 *   expected: WorkProfile,
 *   max: WorkProfile
 * }} workProfiles
 * @property {{
 *   maxWorkedHoursPerWeek: number
 * }} constraints
 * @property {RestaurantIncomeSource[]} incomeSources
 */

/**
 * One analyzed cell in the 3x3 scenario matrix.
 *
 * @typedef {Object} IncomeGapScenarioCell
 * @property {string} id
 * @property {"low" | "expected" | "high"} expenseScenario
 * @property {"conservative" | "expected" | "strong"} incomeScenario
 * @property {"conservative" | "expected" | "max"} workProfile
 * @property {number} monthlyExpenses
 * @property {number} requiredIncome
 * @property {number} currentIncome
 * @property {number} gap
 * @property {number} currentWorkedHoursPerMonth
 * @property {number} maxWorkedHoursPerMonth
 * @property {number} remainingWorkedHoursPerMonth
 * @property {number} gapHours
 * @property {"feasible" | "infeasible" | "surplus"} feasibility
 * @property {"gap" | "surplus"} status
 */

/**
 * The display-ready result of the plan analysis.
 *
 * @typedef {Object} IncomeGapMatrix
 * @property {{
 *   expenseScenarios: string[],
 *   incomeScenarios: string[]
 * }} axes
 * @property {"conservative" | "expected" | "max"} workProfile
 * @property {IncomeGapScenarioCell[]} cells
 */

/**
 * Example raw plan input for the first implementation pass.
 *
 * @type {PlanInput}
 */
export const examplePlanInput = {
  expenses: {
    fixedLineItems: [
      { id: "rent", label: "Rent", monthlyAmount: 1000, isEnabled: true },
      { id: "parking", label: "Parking", monthlyAmount: 200, isEnabled: true },
      { id: "insurance", label: "Insurance", monthlyAmount: 400, isEnabled: true },
      { id: "internet", label: "Internet", monthlyAmount: 65, isEnabled: true },
      { id: "subscription", label: "Subscription", monthlyAmount: 10, isEnabled: true },
    ],
    variableLineItems: [
      {
        id: "groceries",
        label: "Groceries",
        isEnabled: true,
        monthlyRange: {
          low: 600,
          high: 1000,
        },
      },
    ],
    irregularLineItems: [
      {
        id: "utilities",
        label: "Utilities",
        amount: 300,
        everyMonths: 2,
        isEnabled: true,
      },
    ],
  },
  goals: {
    savingsRate: 0.1,
    investingRate: 0.2,
    rateBasis: "required_income",
  },
  workProfiles: {
    conservative: {
      shiftsPerWeek: 3,
      workedHoursPerShift: 7,
    },
    expected: {
      shiftsPerWeek: 4,
      workedHoursPerShift: 7,
    },
    max: {
      shiftsPerWeek: 5,
      workedHoursPerShift: 7,
    },
  },
  constraints: {
    maxWorkedHoursPerWeek: 40,
  },
  incomeSources: [
    {
      id: "restaurant-job",
      type: "restaurant",
      label: "Restaurant Job",
      baseHourlyRate: 17.81,
      assumptions: {
        mealViolationsPerShift: {
          expected: 0.7,
          low: null,
          high: null,
          conservative: 0.6,
          strong: 0.8,
        },
        servingShare: {
          expected: 0.375,
          low: null,
          high: null,
          conservative: 0.3,
          strong: 0.45,
        },
        serverHourly: {
          expected: 42.5,
          low: null,
          high: null,
          conservative: 30,
          strong: 55,
        },
      },
    },
  ],
};

/**
 * Example of the planned future `serverHourly` contract for the slider-based UI.
 *
 * This is not wired into the runtime analysis yet; it exists as the explicit
 * migration target for the upcoming slider implementation.
 */
export const exampleServerHourlySliderAssumption = {
  range: {
    min: 17.81,
    max: 100,
  },
  conservative: 30,
  expected: {
    mode: "derived",
    manualValue: null,
  },
  strong: 55,
};
