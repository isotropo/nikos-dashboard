export const EXPENSE_SCENARIOS = ["low", "expected", "high"];
export const INCOME_SCENARIOS = ["conservative", "expected", "strong"];
export const WORK_PROFILES = ["conservative", "expected", "max"];

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
 * A fixed expense entered directly by the user. This is a line item, not a
 * pre-summed monthly total.
 *
 * @typedef {Object} FixedExpenseLineItem
 * @property {string} id
 * @property {string} label
 * @property {number} monthlyAmount
 */

/**
 * A variable monthly expense whose expected value can later diverge into a
 * fuller variance model.
 *
 * @typedef {Object} VariableExpenseLineItem
 * @property {string} id
 * @property {string} label
 * @property {VarianceValue} monthlyAmount
 */

/**
 * An irregular expense that must be normalized into a monthly value.
 *
 * @typedef {Object} IrregularExpenseLineItem
 * @property {string} id
 * @property {string} label
 * @property {number} amount
 * @property {number} everyMonths
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
 *   serverHourly: VarianceValue
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
 *   investingRate: number
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
      { id: "rent", label: "Rent", monthlyAmount: 1000 },
      { id: "parking", label: "Parking", monthlyAmount: 200 },
      { id: "insurance", label: "Insurance", monthlyAmount: 400 },
      { id: "internet", label: "Internet", monthlyAmount: 65 },
      { id: "subscription", label: "Subscription", monthlyAmount: 10 },
    ],
    variableLineItems: [
      {
        id: "groceries",
        label: "Groceries",
        monthlyAmount: {
          expected: 800,
          low: 600,
          high: 1000,
          conservative: null,
          strong: null,
        },
      },
    ],
    irregularLineItems: [
      {
        id: "utilities",
        label: "Utilities",
        amount: 300,
        everyMonths: 2,
      },
    ],
  },
  goals: {
    savingsRate: 0.1,
    investingRate: 0.2,
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
      shiftsPerWeek: 5.5,
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
          expected: 42,
          low: null,
          high: null,
          conservative: 30,
          strong: 55,
        },
      },
    },
  ],
};
