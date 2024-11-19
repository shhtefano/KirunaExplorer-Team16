export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-leaflet|@react-leaflet|leaflet|leaflet-draw)/)",
  ],
  moduleNameMapper: {
    // Handle module aliases (if any) defined in your Vite config
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "@testing-library/jest-dom"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"], // Specify files to include
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"], // Text for terminal, lcov for HTML report
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/components/ui/", // Ignore the UI components folder
  ],
};
