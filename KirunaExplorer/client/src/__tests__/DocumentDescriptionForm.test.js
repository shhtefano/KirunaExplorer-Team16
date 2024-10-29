import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentDescriptionForm from "../components/document-description-form";
import { toast } from "sonner";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("DocumentDescriptionForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with all elements", () => {
    render(<DocumentDescriptionForm />);

    expect(screen.getByText("Add document description")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Your document description")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add document" })
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<DocumentDescriptionForm />);

    const submitButton = screen.getByRole("button", { name: "Add document" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("You have to select a document")
      ).toBeInTheDocument();
      expect(screen.getByText("A description is required")).toBeInTheDocument();
    });
  });

  it("shows error when description is too short", async () => {
    render(<DocumentDescriptionForm />);

    const descriptionInput = screen.getByPlaceholderText(
      "Your document description"
    );
    await userEvent.type(descriptionInput, "a");

    const submitButton = screen.getByRole("button", { name: "Add document" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Description must be at least 2 characters")
      ).toBeInTheDocument();
    });
  });

  it("successfully submits form with valid data", async () => {
    render(<DocumentDescriptionForm />);

    // Select a document using the correct aria role
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);

    // Find and click the option by role and name
    const option = screen.getByRole("option", { name: "Example document #1" });
    fireEvent.click(option);

    // Enter description
    const descriptionInput = screen.getByPlaceholderText(
      "Your document description"
    );
    await userEvent.type(descriptionInput, "This is a valid description");

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Add document" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Added document description",
        expect.any(Object)
      );
    });

    // Check if form was reset
    expect(descriptionInput).toHaveValue("");
  });

  it("calls undo function when clicking undo in toast", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<DocumentDescriptionForm />);

    // Select a document
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);

    const option = screen.getByRole("option", { name: "Example document #1" });
    fireEvent.click(option);

    // Enter description
    const descriptionInput = screen.getByPlaceholderText(
      "Your document description"
    );
    await userEvent.type(descriptionInput, "Test description");

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Add document" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // Get the action object passed to toast.success
    const toastCall = toast.success.mock.calls[0][1];
    toastCall.action.onClick();

    expect(consoleSpy).toHaveBeenCalledWith("Undo");
    consoleSpy.mockRestore();
  });

  it("shows error when description is too long", async () => {
    render(<DocumentDescriptionForm />);

    const descriptionInput = screen.getByPlaceholderText(
      "Your document description"
    );
    const longText = "a".repeat(201);
    await userEvent.type(descriptionInput, longText);

    const submitButton = screen.getByRole("button", { name: "Add document" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Description must be less than 200 characters")
      ).toBeInTheDocument();
    });
  });
});
