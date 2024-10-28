import { render, screen } from "@testing-library/react";
import App from "@/App";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      media: "",
      onchange: null,
      addListener: () => {}, // For older browsers
      removeListener: () => {}, // For older browsers
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };
  };

test("renders Kiruna Explorer text", () => {
  render(<App />);
  const heading = screen.getByRole("heading", { name: /Kiruna Explorer/i });
  expect(heading).toBeInTheDocument();
});
