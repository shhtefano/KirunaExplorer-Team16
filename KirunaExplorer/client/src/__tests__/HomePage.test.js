import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "@/pages/Home";
import { toast } from "sonner";

// Mock the toast function to check if it gets called
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("HomePage Component", () => {
  test("renders 'See Map' button", () => {
    render(<HomePage />);
    const seeMapButton = screen.getByRole("button", { name: /See Map/i });
    expect(seeMapButton).toBeInTheDocument();
  });

  test("calls toast when clicking the 'Microwave' button", () => {
    render(<HomePage />);

    // Find the "Microwave" button by its icon role and click it
    const microwaveButton = screen.getByRole("button", { name: /Microwave/i });
    fireEvent.click(microwaveButton);

    // Check if the toast.success function was called
    expect(toast.success).toHaveBeenCalledWith("Created Kiruna Event", {
      description: "Sunday, November 01, 2024 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: expect.any(Function),
      },
    });
  });
});
