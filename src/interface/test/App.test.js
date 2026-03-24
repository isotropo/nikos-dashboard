import { fireEvent, render, screen } from "@testing-library/react";
import App from "../App";

test("renders navigation and the default data page", () => {
  render(<App />);

  expect(screen.getByText("Data")).toBeInTheDocument();
  expect(screen.getByText("Analytics")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
  expect(screen.getByText("Hey here is some Data!")).toBeInTheDocument();
});

test("renders the income gap matrix on the analytics page", () => {
  render(<App />);

  fireEvent.click(screen.getByText("Analytics"));

  expect(screen.getByText("Income Gap Matrix")).toBeInTheDocument();
  expect(screen.getByText("Conservative Income")).toBeInTheDocument();
  expect(screen.getByText("Expected Expenses")).toBeInTheDocument();
  expect(screen.getAllByText("Hours Capacity Left").length).toBeGreaterThan(0);
});
