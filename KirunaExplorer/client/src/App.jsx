import "./App.css";
import { Providers } from "./components/providers";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/Home";
import MapPage from "./pages/Map";
import GraphPage from "./pages/Graph";

function App() {
  return (
    <BrowserRouter>
      <Providers>{/* Your routes and other content */}</Providers>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
