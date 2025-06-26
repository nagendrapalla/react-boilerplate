import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErrorElement } from "@/error/ErrorElement";
import { Constant } from "@/shared/utlis/constants";

describe("ErrorElement Component", () => {
  const error = new Error(Constant.SomethingWentWrong);

  test("renders ErrorElement component", () => {
    render(<ErrorElement error={error} />);
    expect(screen.getByText(Constant.SomethingWentWrong)).toBeInTheDocument();
  });

  test("displays the correct error message", () => {
    render(<ErrorElement error={error} />);
    expect(screen.getByText(Constant.SomethingWentWrong)).toBeInTheDocument();
  });

  test("renders with a different error message", () => {
    const differentError = new Error("A different error occurred");
    render(<ErrorElement error={differentError} />);
    expect(screen.getByText("A different error occurred")).toBeInTheDocument();
  });

  test("renders with a default error message when error message is undefined", () => {
    const errorWithUndefinedMessage = new Error();
    errorWithUndefinedMessage.message = undefined as unknown as string;
    render(<ErrorElement error={errorWithUndefinedMessage} />);
    expect(screen.getByText(Constant.SomethingWentWrong)).toBeInTheDocument();
  });
});
