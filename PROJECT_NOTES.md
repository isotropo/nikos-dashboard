# Project Notes

## Overview

This project is a React dashboard for answering:

> Given my expenses, income variability, and goals, how much do I need to work, and do I have a gap?

It is not a budgeting app. It is a work-requirement and feasibility calculator.

Core outputs:

- Required monthly income
- Income from the current work schedule
- Remaining monetary gap to fill
- Hour gap or surplus
- Feasibility relative to chosen work behavior and hour limits
- Later: recommendations and more detailed constraints

## Product Model

Translate:

- Expenses: fixed, variable, irregular
- Goals: savings and investing as recurring monthly targets
- Income sources: hourly, tipped, variable
- Work constraints: shifts, hours, availability

Into:

- Required income
- Actual income from the current plan
- Gap in money
- Gap or surplus in worked hours
- Feasibility insight

## Example Inputs

Expenses:

- Rent: 1000
- Parking: 200
- Insurance: 400
- Internet: 65
- Subscription: 10
- Groceries: 600 to 1000
- Utilities: 300 every 2 months, normalized to 150 per month

Goals:

- Savings: 10% of income
- Investing: 20% of income

Restaurant income:

- Base rate: 17.81 per hour
- Server effective rate: 30 to 55 per hour
- Serving share: 30% to 45%

Work structure:

- Conservative work profile: 3 shifts per week
- Expected work profile: 4 shifts per week
- Max work profile: 5 shifts per week
- 7 worked hours per shift for the current example

Important rule:

- Meal violation is paid time, but not worked time
- Meal violations are shift-linked, but should not be treated as a guaranteed 1 hour per shift
- Current model treats them as an average `mealViolationsPerShift`

## Core Formulas

Monthly expenses:

```js
expenses = fixed + variable + normalizedIrregular;
```

Required income when savings and investing are percent-based:

```js
requiredIncome = expenses / (1 - savingsRate - investingRate);
```

Current supported alternative:

```js
requiredIncome = expenses + currentIncome * (savingsRate + investingRate);
```

The formula now depends on `goals.rateBasis`:

- `required_income`
- `actual_income`

Restaurant income:

```js
shiftsPerMonth = shiftsPerWeek * 4.33;

workedHours = shiftsPerMonth * workedHoursPerShift;
mealPremiumHours = shiftsPerMonth * mealViolationsPerShift;

blendedHourly =
  servingShare * serverRate +
  (1 - servingShare) * baseRate;

income =
  workedHours * blendedHourly +
  mealPremiumHours * baseRate;
```

Final output:

```js
gap = requiredIncome - currentIncome;
```

Hour-gap approximation:

```js
effectiveWorkedHourly = weightedIncome / workedHours;
gapHours = gap / effectiveWorkedHourly;
```

The monetary gap is still the primary output, but hour feasibility is now a core companion output.

## Product Principles

- Prioritize money gap, not just hours
- Support uncertainty explicitly
- Keep expense uncertainty separate from income uncertainty
- Keep work behavior separate from both
- Handle uncertainty with ranges
- Distinguish worked hours from paid hours
- Detect when the current plan is infeasible

## Scope Constraints

Do not build:

- Bank syncing
- Transaction ingestion
- A full budgeting system
- A tax engine
- Monte Carlo simulation
- An AI-first interface for now

Focus on:

- Deterministic calculations
- Clean input to output flow
- Clarity

## React Principles

Store only raw inputs in state.

Do not store derived values such as:

- Monthly target
- Hours required
- Gap

Derived values should be computed during render or by pure helper functions.

State ownership:

- State belongs in the lowest common parent
- Components receive props
- Components should not mutate shared global objects

Business logic belongs outside components, for example:

```js
buildIncomeGapMatrix();
```

Components should stay UI-focused.

## Current Source Of Truth

Primary files:

- `src/domain/planModel.js` defines the raw planning data contract
- `src/domain/analysis.js` derives the analytics matrix from that raw plan input
- `src/interface/analytics/IncomeGapMatrix.js` renders the current analytics UI
- `src/interface/pages/InputsPage.js` is the current editable planning surface

Current ownership split:

- Income scenario means how well the work pays
- Work profile means how much the user chooses to work
- Expense scenario means how costly the month is

## Current Domain Model

Raw user-authored data is nested by type and stored separately from derived values.

Current shape:

```js
planInput = {
  expenses: {
    fixedLineItems: [],
    variableLineItems: [],
    irregularLineItems: [],
  },
  goals: {
    savingsRate,
    investingRate,
    rateBasis,
  },
  workProfiles: {
    conservative: { shiftsPerWeek, workedHoursPerShift },
    expected: { shiftsPerWeek, workedHoursPerShift },
    max: { shiftsPerWeek, workedHoursPerShift },
  },
  constraints: {
    maxWorkedHoursPerWeek,
  },
  incomeSources: [
    {
      type: "restaurant",
      baseHourlyRate,
      assumptions: {
        mealViolationsPerShift,
        servingShare,
        serverHourly,
      },
    },
  ],
};
```

Important modeling rules:

- `fixedMonthlyCosts` should not be stored as a raw input
- Fixed monthly totals are derived from `fixedLineItems`
- Irregular expenses are normalized from line items such as `300 every 2 months`
- Variable expenses are currently entered as named `low/high` ranges
- The expected variable-expense case is derived as the midpoint of the range
- Expense scenarios and income scenarios are independent axes
- Work behavior is a third dimension, but shown through a selector instead of 27 cards
- Work-profile `shiftsPerWeek` should currently snap to whole integers; doubles and partial-shift modeling can come later
- Goals currently include `savingsRate`, `investingRate`, and a shared `rateBasis`
- Expense line items now support `isEnabled`
- `serverHourly` still uses the current numeric scenario shape at runtime, but `planModel.js` now defines an explicit future slider contract and example target shape

## Current Input Architecture

The Inputs page is now a real editable surface backed by shared `planInput` state in `App`.

Current UI structure:

- Top-level page: `Inputs`
- Top-level view switch inside Inputs: `Expenses`, `Income`, and `Goals`

`Expenses` currently contains:

- Fixed Monthly Expenses
- Variable Expenses
- Irregular Expenses

`Income` currently contains:

- Work Profiles
- Constraints
- Restaurant Income

`Goals` currently contains:

- Savings Rate
- Investing Rate
- Shared `Rate Basis`

Current behavior:

- Fixed expenses are editable dynamic line items with add/remove support
- Variable expenses are editable dynamic named ranges with add/remove support
- Irregular expenses are editable dynamic name/amount/cadence items with add/remove support
- Expense items can now be included or excluded with per-row toggles
- Goal rates display as percentages in the UI but are still stored as decimals
- Goals now expose a shared `Rate Basis` control: `Required Income` or `Actual Income`
- Work profiles now use an integrated slider for `shiftsPerWeek`, with `expected` defaulting to the rounded midpoint between conservative and max
- `servingShare` now uses an integrated multi-marker slider from `0%` to `100%`, with `expected` defaulting to the midpoint unless manually adjusted
- `serverHourly` now uses an adapter-first integrated multi-marker slider in the Income tab while still writing back into the current runtime numeric shape
- Editing inputs updates the analytics page live through shared app state
- The mobile shell now uses a sticky top nav and safer viewport/scroll behavior instead of relying on the original `absolute + 100vh` layout

Emerging direction:

- The Analytics page will likely need compact assumption summaries so users can see not just outcomes, but the key inputs driving each scenario card
- Long term, schedule-aware integrations such as Google Calendar, and possibly HotSchedules if practical, could make work-feasibility inputs more grounded in actual scheduled reality

Current limitation:

- The current `Expenses / Income / Goals` split is still a UI organization layer
- The page is still not fully settled as the long-term product experience

## Current UI

The main analytics UI is now `IncomeGapMatrix` on the Analytics page.

Presentation model:

- Rows: expense scenarios `low / expected / high`
- Columns: income scenarios `conservative / expected / strong`
- Selector above the matrix: work profile `conservative / expected / max`
- A compact `Work Assumptions` summary explains the selected work profile
- A compact `Income Assumptions` summary explains the pay-side assumptions behind the three income columns
- A `Serving Share Isolation` control can freeze serving share to `conservative`, `expected`, or `strong`, or return to scenario-driven mode by tapping the active option again

Each scenario card shows:

- Monthly expenses
- Required income
- Current income
- Worked hours
- Remaining hour capacity
- Hour gap or surplus
- Money gap or surplus
- Feasibility message

Mobile behavior:

- Desktop keeps the full 3x3 matrix
- Mobile uses a swipeable, native scroll-snap income carousel
- Work profile selection stays above the analytics view
- The app shell now collapses into a top sticky nav on smaller screens so page switching remains tappable while the content scrolls

## Current Shipped State

Recent implemented milestones:

- React page selection moved out of the global `APP` object and into React state
- Analytics page now renders a real `IncomeGapMatrix`
- Matrix cards show both monetary and hour-based gap information
- Analytics now supports a selectable work-profile layer
- Analytics now includes compact `Work Assumptions` and `Income Assumptions` summaries
- Analytics now supports optional serving-share isolation without changing saved input values
- Inputs page now edits shared `planInput` state used directly by Analytics
- Inputs are split into `Expenses`, `Income`, and `Goals` views
- Fixed, variable, and irregular expenses are all now dynamic editable collections
- Expense items can now be toggled in or out of analysis with `isEnabled`
- Goal rate basis is now explicit in both the data model and the UI
- A future slider contract for `serverHourly` is now defined in `planModel.js`
- The Income tab now includes a custom `WorkProfilesSlider` with conservative / expected / max markers on one shared track
- The Income tab now includes a custom `ServingShareRangeSlider` with conservative / expected / strong markers on one shared track
- The Income tab now includes a custom `ServerHourlyRangeSlider` with conservative / expected / strong markers on one shared track
- The app shell now has a mobile-specific sticky nav and safer viewport-height handling for iOS Safari

Relevant commits:

- `41d0554` Refactor page selection into React state
- `c1434ec` Add income gap analytics matrix
- `e476701` Add selectable work profiles to analytics
- `6ae7a38` Add first pass of editable plan inputs
- `b07dff4` Improve fixed expense inputs workflow
- `7055665` Refine variable expense range inputs
- `15c551f` Add dynamic irregular expense inputs
- `cf2065f` Add include toggles for expense items
- `6009ab6` Add explicit goal rate basis
- `98a0f5b` Support goal rates based on actual income
- `6d101b6` Add goal rate basis controls
- `6eb51ff` Add goals tab to inputs
- `4b19b64` Define server hourly slider contract
- `b028804` Prototype server hourly slider editing
- `1c639a5` Split inputs into expenses and income views

## Presentation Decisions

Current presentation choices:

- Keep the main screen as a 3x3 matrix
- Use rows for expense scenarios
- Use columns for income scenarios
- Use a selector for work behavior rather than rendering 27 cards at once
- Treat the expected/expected cell as the center baseline
- Think of the surrounding cells as directional risk regions around that center
- Keep the Inputs page separate from Analytics
- Use `Expenses`, `Income`, and `Goals` as top-level input views for now

The matrix currently aims to answer:

- What happens if expenses get worse?
- What happens if pay assumptions weaken?
- What changes if I work conservatively, as expected, or at my max?

## Known Simplifications

Current model simplifications:

- No overtime logic yet
- Meal violations are approximated as an average `mealViolationsPerShift`
- Only one restaurant income source is modeled so far
- Hour-gap is approximated using the current effective worked-hour earning rate
- Work profiles currently focus on shift volume, not full sustainability or burnout modeling
- Goals are still only percent-based rules, not fixed monthly amounts or percent-with-minimum
- Variable expenses only support `low/high`; midpoint-derived `expected` is implicit
- Analysis still does not explain included versus excluded items explicitly on the Analytics page
- The `serverHourly` slider currently uses an adapter layer rather than the future runtime contract
- Both `servingShare` and `serverHourly` now use integrated slider interactions, but only `serverHourly` has an explicit future runtime contract defined so far
- Work-profile `shiftsPerWeek` now uses an integrated slider, but doubles and partial-shift behavior are still intentionally deferred
- Analytics now exposes key work and income assumptions, but still emphasizes outcomes more than fully isolated variable analysis
- Work-profile shifts are intentionally treated as whole-shift counts for now
- Schedule syncing is not implemented; work profiles are still user-authored rather than imported from a calendar or scheduling system

## Open Product Questions

Questions to revisit later:

- How should `hours gap` be explained most clearly in the UI?
- When should work profiles expand beyond shift counts into sustainability or energy profiles?
- How should multiple income sources fit into the matrix and analysis model?
- What is the right long-term tab structure: `Expenses / Income`, `Needs / Income`, or `Needs / Income / Goals`?
- How should recurring savings/investing targets differ from longer-horizon life goals?
- How broadly should `isEnabled` or include/exclude controls extend beyond expenses into goals and income sources?
- Are `Required Income` and `Actual Income` the clearest user-facing labels for goal rate basis?
- When should the temporary `serverHourly` adapter be replaced by a full runtime migration to the slider contract?
- Should serving-share isolation expand into a broader variable-isolation system for other income assumptions?
- How should the work-profile slider eventually relate to doubles, split shifts, or broader sustainability modeling?
- What is the clearest way to show the key assumptions behind each analytics scenario card without making the matrix too dense?
- What is the right editing flow for raw line-item inputs without losing the clean derived-data structure?
- When should overtime, double meal violations, and schedule availability be introduced?
- What is the right path for schedule-aware integrations such as Google Calendar or HotSchedules, and when should those move from product vision into implementation?

## Next Priorities

1. Revisit the long-term organization of goals versus expenses/needs
2. Decide how goal modes should expand beyond percent rates: fixed monthly amount and percent with minimum
3. Decide how broadly include/exclude controls should extend beyond expenses
4. Decide whether goal rate basis should remain shared or become per-goal later
5. Add multiple income sources cleanly into the current domain model
6. Decide whether serving-share isolation should expand to `serverHourly`, `mealViolationsPerShift`, or other variables
7. Decide whether work-profile `workedHoursPerShift` should stay numeric or get a clearer shared interaction
8. Decide when to migrate `serverHourly` from the adapter layer to the future runtime contract
9. Make hour-gap and feasibility wording clearer in the UI
10. Consider showing included versus excluded items more explicitly on Analytics
11. Expand work profiles into richer sustainability constraints when needed
12. Add recommendation logic after inputs and analysis are more complete

## Mental Model

This app is a constraint and feasibility system, not a budgeting tool.

Main questions:

- Is my current setup enough?
- If not, how much money am I short?
- If I keep my current work behavior, is the gap feasible to close?
- What changes if I work conservatively, as expected, or at my max?
- What lever reduces that gap fastest?

## Edge Cases For Later

- Income is 0
- Savings plus investing is 100% or more
- Negative gap meaning surplus
- Very wide uncertainty ranges
- No available hours
