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
import ShowDocumentsPage from "./pages/ShowDocuments";
import AreaMap from "./pages/AreaMap";
import Resources from "./pages/Resources";
import EditDocumentPage from "./pages/EditDocumentPage";

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
            path="/editDocument"
            element={
              <ProtectedRoute>
                <EditDocumentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents/list"
            element={
              // <ProtectedRoute>
              <ShowDocumentsPage />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/areas"
            element={
              // <ProtectedRoute>
              <AreaMap />
              // </ProtectedRoute>
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
           <Route
            path="/addresources"
            element={  
              <ProtectedRoute>  
                <Resources/>
              </ProtectedRoute>  
            }
          />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}

export default App;
