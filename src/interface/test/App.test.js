import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders navigation and the default data page", () => {
  render(<App />);

  expect(screen.getByText("Data")).toBeInTheDocument();
  expect(screen.getByText("Analytics")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
  expect(screen.getByText("Hey here is some Data!")).toBeInTheDocument();
});
