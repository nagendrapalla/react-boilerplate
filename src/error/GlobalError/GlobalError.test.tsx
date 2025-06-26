import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GlobalError } from "@/error/GlobalError";
import { Constant } from "@/shared/utlis/constants";

describe("GlobalError Component", () => {
  const mockError = new Error("Test error");
  const mockResetErrorBoundary = jest.fn();

  test("renders GlobalError component", () => {
    render(<GlobalError error={mockError} resetErrorBoundary={mockResetErrorBoundary} />);
    expect(screen.getByText(Constant.SomethingWentWrong)).toBeInTheDocument();
  });

  test("displays the correct error message", () => {
    render(<GlobalError error={mockError} resetErrorBoundary={mockResetErrorBoundary} />);
    expect(screen.getByText(Constant.SomethingWentWrong)).toBeInTheDocument();
  });

  test("renders AlertTriangle icon", () => {
    render(<GlobalError error={mockError} resetErrorBoundary={mockResetErrorBoundary} />);
    const icon = screen.getByTestId("alert-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-10 h-10 text-gray-500");
  });

  test("renders Card component", () => {
    render(<GlobalError error={mockError} resetErrorBoundary={mockResetErrorBoundary} />);
    const card = screen.getByTestId("error-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass(
      "w-[25%] border-0 shadow-lg flex flex-col justify-center items-center py-16 gap-y-6",
    );
  });
});
