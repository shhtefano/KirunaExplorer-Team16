import "./App.css";
import { Providers } from "./components/providers";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/Home";
import MapPage from "./pages/Map";

function App() {
  return (
    <BrowserRouter>
      <Providers>{/* Your routes and other content */}</Providers>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
