import { fireEvent, render, screen } from "@testing-library/react";
import App from "../App";

test("renders navigation and the default inputs page", () => {
  render(<App />);

  expect(screen.getAllByText("Inputs").length).toBeGreaterThan(0);
  expect(screen.getByText("Analytics")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Inputs" })).toBeInTheDocument();
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
  expect(screen.getAllByText("166.7 hrs").length).toBeGreaterThan(0);
});
