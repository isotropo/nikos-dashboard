import { fireEvent, render, screen } from "@testing-library/react";
import App from "../App";
import { buildIncomeGapMatrix } from "../../domain/analysis";
import { examplePlanInput } from "../../domain/planModel";

test("renders navigation and the default inputs page", () => {
  render(<App />);

  expect(screen.getAllByText("Inputs").length).toBeGreaterThan(0);
  expect(screen.getByText("Analytics")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Inputs" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Expenses" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Income" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Goals" })).toBeInTheDocument();
});

test("renders the income gap matrix on the analytics page", () => {
  render(<App />);

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getByText("Income Gap Matrix")).toBeInTheDocument();
  expect(screen.getAllByText("Conservative Income").length).toBeGreaterThan(0);
  expect(screen.getByText("Expected Expenses")).toBeInTheDocument();
  expect(screen.getByText("Work Profile: Expected Work")).toBeInTheDocument();
  expect(screen.getAllByText("Hours Capacity Left").length).toBeGreaterThan(0);
});

test("switches the matrix when the work profile changes", () => {
  render(<App />);

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("121.2 hrs").length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole("button", { name: "Max Work" }));

  expect(screen.getByText("Work Profile: Max Work")).toBeInTheDocument();
  expect(screen.getAllByText("151.5 hrs").length).toBeGreaterThan(0);
});

test("updates analytics when inputs change", () => {
  render(<App />);

  const rentInput = screen.getByLabelText("Rent Monthly Amount");
  fireEvent.change(rentInput, { target: { value: "1200" } });

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$2,625").length).toBeGreaterThan(0);
});

test("excludes disabled fixed expenses from analytics", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText("Include Rent"));

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$1,625").length).toBeGreaterThan(0);
});

test("adds a fixed expense line item and updates analytics", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Add Fixed Expense" }));

  const newNameInput = screen.getByDisplayValue("New Line Item");
  const newAmountInput = screen.getAllByDisplayValue("0")[0];

  fireEvent.change(newNameInput, { target: { value: "Phone" } });
  fireEvent.change(newAmountInput, { target: { value: "100" } });

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$2,525").length).toBeGreaterThan(0);
});

test("adds a variable expense range and uses the midpoint for expected analytics", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Add Variable Expense" }));

  fireEvent.change(
    screen.getByLabelText("New Variable Expense Low Monthly Amount"),
    { target: { value: "100" } }
  );
  fireEvent.change(
    screen.getByLabelText("New Variable Expense High Monthly Amount"),
    { target: { value: "200" } }
  );

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$2,775").length).toBeGreaterThan(0);
});

test("adds an irregular expense and updates analytics through normalization", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Add Irregular Expense" }));

  fireEvent.change(
    screen.getByLabelText("New Irregular Expense Amount"),
    { target: { value: "120" } }
  );
  fireEvent.change(
    screen.getByLabelText("New Irregular Expense Every N Months"),
    { target: { value: "3" } }
  );

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$2,665").length).toBeGreaterThan(0);
});

test("switches between expenses and income input views", () => {
  render(<App />);

  expect(screen.getByText("Fixed Monthly Expenses")).toBeInTheDocument();
  expect(screen.queryByText("Restaurant Income")).not.toBeInTheDocument();
  expect(screen.queryByText("Savings Rate")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Income" }));

  expect(screen.getByText("Restaurant Income")).toBeInTheDocument();
  expect(screen.queryByText("Fixed Monthly Expenses")).not.toBeInTheDocument();
});

test("updates analytics from the work profiles slider", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Income" }));
  fireEvent.change(screen.getByLabelText("Expected Work Shifts Slider"), {
    target: { value: "5" },
  });
  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("151.5 hrs").length).toBeGreaterThan(0);
});

test("switches to the goals input view", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Goals" }));

  expect(screen.getByRole("heading", { name: "Goals" })).toBeInTheDocument();
  expect(screen.getByLabelText("Savings Rate")).toBeInTheDocument();
  expect(screen.queryByText("Fixed Monthly Expenses")).not.toBeInTheDocument();
  expect(screen.queryByText("Restaurant Income")).not.toBeInTheDocument();
});

test("preserves the selected inputs tab when switching pages", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Goals" }));
  expect(screen.getByRole("heading", { name: "Goals" })).toBeInTheDocument();

  fireEvent.click(screen.getByText("Analytics"));
  expect(screen.getByText("Income Gap Matrix")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Inputs"));

  expect(screen.getByRole("heading", { name: "Goals" })).toBeInTheDocument();
  expect(screen.getByLabelText("Savings Rate")).toBeInTheDocument();
});

test("switches goal rate basis from the inputs UI", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Goals" }));
  fireEvent.click(screen.getByRole("radio", { name: "Actual Income" }));
  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$3,674").length).toBeGreaterThan(0);
});

test("updates analytics from the server hourly slider adapter", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Income" }));
  fireEvent.change(screen.getByLabelText("Server Hourly Expected Slider"), {
    target: { value: "50" },
  });
  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getAllByText("$3,839").length).toBeGreaterThan(0);
});

test("updates the serving share slider readout", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Income" }));
  fireEvent.change(screen.getByLabelText("Serving Share Strong Slider"), {
    target: { value: "0.6" },
  });

  expect(screen.getAllByText("60%").length).toBeGreaterThan(0);
});

test("supports goal rates based on actual projected income", () => {
  const actualIncomePlanInput = {
    ...examplePlanInput,
    goals: {
      ...examplePlanInput.goals,
      rateBasis: "actual_income",
    },
  };

  const actualIncomeMatrix = buildIncomeGapMatrix(actualIncomePlanInput, "expected");
  const requiredIncomeMatrix = buildIncomeGapMatrix(examplePlanInput, "expected");
  const actualIncomeCell = actualIncomeMatrix.cells.find(
    (cell) =>
      cell.expenseScenario === "expected" &&
      cell.incomeScenario === "expected"
  );
  const requiredIncomeCell = requiredIncomeMatrix.cells.find(
    (cell) =>
      cell.expenseScenario === "expected" &&
      cell.incomeScenario === "expected"
  );

  expect(actualIncomeCell.requiredIncome).toBeCloseTo(
    actualIncomeCell.monthlyExpenses +
      (actualIncomeCell.currentIncome * (examplePlanInput.goals.savingsRate + examplePlanInput.goals.investingRate)),
    5
  );
  expect(actualIncomeCell.currentIncome).toBeCloseTo(requiredIncomeCell.currentIncome, 5);
  expect(actualIncomeCell.requiredIncome).toBeLessThan(requiredIncomeCell.requiredIncome);
  expect(actualIncomeCell.gap).toBeLessThan(requiredIncomeCell.gap);
});

test("serving share assumptions affect strong-income analytics", () => {
  const updatedPlanInput = {
    ...examplePlanInput,
    incomeSources: examplePlanInput.incomeSources.map((source) =>
      source.id === "restaurant-job"
        ? {
            ...source,
            assumptions: {
              ...source.assumptions,
              servingShare: {
                ...source.assumptions.servingShare,
                strong: 0.6,
              },
            },
          }
        : source
    ),
  };

  const defaultMatrix = buildIncomeGapMatrix(examplePlanInput, "expected");
  const updatedMatrix = buildIncomeGapMatrix(updatedPlanInput, "expected");
  const defaultStrongCell = defaultMatrix.cells.find(
    (cell) =>
      cell.expenseScenario === "expected" &&
      cell.incomeScenario === "strong"
  );
  const updatedStrongCell = updatedMatrix.cells.find(
    (cell) =>
      cell.expenseScenario === "expected" &&
      cell.incomeScenario === "strong"
  );

  expect(updatedStrongCell.currentIncome).toBeGreaterThan(defaultStrongCell.currentIncome);
});
