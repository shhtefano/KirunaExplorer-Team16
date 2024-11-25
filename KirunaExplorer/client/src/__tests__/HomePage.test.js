import { render, screen } from "@testing-library/react";
import HomePage from "@/pages/Home";
import { AuthProvider } from "@/contexts/AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock the toast function to check if it gets called
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("HomePage Component", () => {
  test("renders 'See Map' button", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>
    );
    const seeMapButton = screen.getByRole("button", { name: /See Map/i });
    expect(seeMapButton).toBeInTheDocument();
  });
});
