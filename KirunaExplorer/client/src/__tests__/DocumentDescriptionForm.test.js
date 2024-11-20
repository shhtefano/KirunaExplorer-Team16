import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentDescriptionForm from "../components/document-description-form";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../components/CoordsMap", () => {
  return function MockCoordsMap() {
    return <div data-testid="coords-map">Map Component</div>;
  };
});

jest.mock("@mui/material/Snackbar", () => ({
  default: ({ children, open }) => (
    <div data-testid="snackbar" data-open={open}>
      {children}
    </div>
  ),
}));

jest.mock("@mui/material/Alert", () => ({
  default: ({ children, severity }) => (
    <div data-testid="alert" data-severity={severity}>
      {children}
    </div>
  ),
}));

describe("DocumentDescriptionForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<DocumentDescriptionForm />);

    expect(screen.getByLabelText(/document/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stakeholder/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/scale/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty submission", async () => {
    render(<DocumentDescriptionForm />);

    const submitButton = screen.getByRole("button", {
      name: /add document description/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/document title is required/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it("handles successful form submission", async () => {
    render(<DocumentDescriptionForm />);

    // Fill required fields
    await userEvent.type(
      screen.getByRole("textbox", { name: /document/i }),
      "Test Document"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /description/i }),
      "Test Description"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /scale/i }),
      "1:100"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /issuance date/i }),
      "2024-01-01"
    );

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /add document description/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByTestId("alert");
      expect(alert).toHaveAttribute("data-severity", "success");
      expect(alert).toHaveTextContent(/added document description/i);
    });
  });

  it("toggles coordinate inputs when area checkbox is clicked", async () => {
    render(<DocumentDescriptionForm />);

    const checkbox = screen.getByRole("checkbox", { name: /municipal area/i });
    const latitudeInput = screen.getByRole("spinbutton", { name: /latitude/i });
    const longitudeInput = screen.getByRole("spinbutton", {
      name: /longitude/i,
    });

    await userEvent.click(checkbox);
    expect(latitudeInput).toBeDisabled();
    expect(longitudeInput).toBeDisabled();

    await userEvent.click(checkbox);
    expect(latitudeInput).not.toBeDisabled();
    expect(longitudeInput).not.toBeDisabled();
  });

  it("displays map popup when clicking map icon", async () => {
    render(<DocumentDescriptionForm />);

    const mapButton = screen.getByRole("button", { name: /map/i });
    fireEvent.click(mapButton);

    expect(screen.getByText("Close Map")).toBeInTheDocument();
  });
});

// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import DocumentDescriptionForm from "../components/document-description-form";
// import { toast } from "sonner";

// // Mock sonner toast
// jest.mock("sonner", () => ({
//   toast: {
//     success: jest.fn(),
//     error: jest.fn(),
//   },
// }));

// describe("DocumentDescriptionForm", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("renders the form with all elements", () => {
//     render(<DocumentDescriptionForm />);

//     expect(screen.getByText("Add document description")).toBeInTheDocument();
//     expect(screen.getByText("Document")).toBeInTheDocument();
//     expect(screen.getByText("Description")).toBeInTheDocument();
//     expect(screen.getByRole("combobox")).toBeInTheDocument();
//     expect(
//       screen.getByPlaceholderText("Your document description")
//     ).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: "Add document" })
//     ).toBeInTheDocument();
//   });

//   it("shows validation errors when submitting empty form", async () => {
//     render(<DocumentDescriptionForm />);

//     const submitButton = screen.getByRole("button", { name: "Add document" });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(
//         screen.getByText("You have to select a document")
//       ).toBeInTheDocument();
//       expect(screen.getByText("A description is required")).toBeInTheDocument();
//     });
//   });

//   it("shows error when description is too short", async () => {
//     render(<DocumentDescriptionForm />);

//     const descriptionInput = screen.getByPlaceholderText(
//       "Your document description"
//     );
//     await userEvent.type(descriptionInput, "a");

//     const submitButton = screen.getByRole("button", { name: "Add document" });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(
//         screen.getByText("Description must be at least 2 characters")
//       ).toBeInTheDocument();
//     });
//   });

//   it("successfully submits form with valid data", async () => {
//     render(<DocumentDescriptionForm />);

//     // Select a document using the correct aria role
//     const selectTrigger = screen.getByRole("combobox");
//     fireEvent.click(selectTrigger);

//     // Find and click the option by role and name
//     const option = screen.getByRole("option", { name: "Example document #1" });
//     fireEvent.click(option);

//     // Enter description
//     const descriptionInput = screen.getByPlaceholderText(
//       "Your document description"
//     );
//     await userEvent.type(descriptionInput, "This is a valid description");

//     // Submit form
//     const submitButton = screen.getByRole("button", { name: "Add document" });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(toast.success).toHaveBeenCalledWith(
//         "Added document description",
//         expect.any(Object)
//       );
//     });

//     // Check if form was reset
//     expect(descriptionInput).toHaveValue("");
//   });

//   it("calls undo function when clicking undo in toast", async () => {
//     const consoleSpy = jest.spyOn(console, "log");
//     render(<DocumentDescriptionForm />);

//     // Select a document
//     const selectTrigger = screen.getByRole("combobox");
//     fireEvent.click(selectTrigger);

//     const option = screen.getByRole("option", { name: "Example document #1" });
//     fireEvent.click(option);

//     // Enter description
//     const descriptionInput = screen.getByPlaceholderText(
//       "Your document description"
//     );
//     await userEvent.type(descriptionInput, "Test description");

//     // Submit form
//     const submitButton = screen.getByRole("button", { name: "Add document" });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(toast.success).toHaveBeenCalled();
//     });

//     // Get the action object passed to toast.success
//     const toastCall = toast.success.mock.calls[0][1];
//     toastCall.action.onClick();

//     expect(consoleSpy).toHaveBeenCalledWith("Undo");
//     consoleSpy.mockRestore();
//   });

//   it("shows error when description is too long", async () => {
//     render(<DocumentDescriptionForm />);

//     const descriptionInput = screen.getByPlaceholderText(
//       "Your document description"
//     );
//     const longText = "a".repeat(201);
//     await userEvent.type(descriptionInput, longText);

//     const submitButton = screen.getByRole("button", { name: "Add document" });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(
//         screen.getByText("Description must be less than 200 characters")
//       ).toBeInTheDocument();
//     });
//   });
// });
