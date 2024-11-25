import { render, screen } from "@testing-library/react";
import { useAuth } from "@/contexts/AuthContext";
import HomePage from "../pages/Home";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/login-form", () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form</div>;
  };
});

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders homepage content", () => {
    useAuth.mockReturnValue({ user: null });
    render(<HomePage />);

    expect(screen.getByText("Kiruna Explorer")).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Kiruna Explorer/)).toBeInTheDocument();
  });

  test("renders navigation buttons with correct links", () => {
    useAuth.mockReturnValue({ user: null });
    render(<HomePage />);

    const navigationItems = [
      { href: "/add-document-description", text: "Add doc" },
      { href: "/documents/link", text: "Link doc" },
      { href: "/documents", text: "See docs" },
      { href: "/map", text: "See Map" },
      { href: "/graph", text: "See graph" },
    ];

    navigationItems.forEach((item) => {
      const link = screen.getByRole("link", { name: new RegExp(item.text) });
      expect(link).toHaveAttribute("href", item.href);
    });
  });

  test("renders login form when user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null });
    render(<HomePage />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
  });

  test("renders user welcome message when authenticated", () => {
    useAuth.mockReturnValue({ user: { username: "testuser", role: "admin" } });
    render(<HomePage />);

    expect(screen.getByText(/Welcome back testuser!/)).toBeInTheDocument();
    expect(screen.getByText(/Your role is: admin/)).toBeInTheDocument();
    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });
});
