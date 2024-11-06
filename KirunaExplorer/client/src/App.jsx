import "./App.css";
import { Providers } from "./components/providers";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoute from "@/routes/AuthRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomePage from "./pages/Home";
import MapPage from "./pages/Map";
import GraphPage from "./pages/Graph";
import LoginPage from "./pages/Login";
import AddDocumentDescPage from "./pages/AddDocumentDesc";
import LinkDocumentsPage from "./pages/LinkDocuments";

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/graph"
            element={
              <ProtectedRoute>
                <GraphPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-document-description"
            element={
              <ProtectedRoute>
                <AddDocumentDescPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/link"
            element={
              <ProtectedRoute>
                <LinkDocumentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
