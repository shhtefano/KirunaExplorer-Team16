import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, GanttChart, User, Folder, Files, FileText, LandPlot } from "lucide-react";
import LoginForm from "@/components/login-form";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import kirunaImage from "@/assets/kiruna.jpg";
import { UserProfileCard } from "@/components/user-profile-card";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleRestrictedAction = (e, path) => {
    if (!user) {
      e.preventDefault();
      setSnackbarMsg('Please log in to access this page.');
      setOpenSnackbar(true);
    } else {
      if (user.role !== 'urban_planner') {
        setSnackbarMsg('You are not authorized to access this page.');
        setOpenSnackbar(true);
      } else {
        navigate(path);
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
    // style={{ height: "40vh" }} // Assicura l'altezza dello schermo
    >
      {/* Background Image with Overlay */}
      <div
        className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden"
        style={{
          backgroundImage: `url(${kirunaImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay to improve content readability */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className=" flex flex-col w-full h-full items-center justify-center p-2 space-y-4 text-center">
        <Card className="min-w-[750px] max-w-1200px] bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Kiruna Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-left mt-2">
              <div className="flex items-center justify-between">
                <Button
                style={{ minWidth: "200px" }}
                  variant="outline"
                  className="flex items-center"
                  onClick={() => navigate("/documents/list")}
                >
                  <Files className="mr-2" />
                  <span>See Docs</span>
                </Button>
                <p className="text-sm text-gray-600 w-2/3">
                  View all documents in a tabular format, making it easy to browse and manage.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Button
                                style={{ minWidth: "200px" }}

                  variant="outline"
                  className="flex items-center"
                  onClick={() => navigate("/map")}
                >
                  <Map className="mr-2" />
                  <span>See Map</span>
                </Button>
                <p className="text-sm text-gray-600 w-2/3">
                  Explore the documents visually on an interactive map.
                </p>
              </div>
              {user?.role === "urban_planner" && (
                <>
                  <div className="flex items-center justify-between">
                    <Button
                                    style={{ minWidth: "200px" }}

                      variant="outline"
                      className="flex items-center"
                      onClick={(e) =>
                        handleRestrictedAction(e, "/add-document-description")
                      }
                    >
                      <FileText className="mr-2" />
                      <span>Add Doc</span>
                    </Button>
                    <p className="text-sm text-gray-600 w-2/3">
                      Upload and add new documents to the system.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                                    style={{ minWidth: "200px" }}

                      variant="outline"
                      className="flex items-center"
                      onClick={() => navigate("/areas")}
                    >
                      <LandPlot className="mr-2" />
                      <span>Edit Areas</span>
                    </Button>
                    <p className="text-sm text-gray-600 w-2/3">
                      Modify the areas associated with specific documents.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                                    style={{ minWidth: "200px" }}

                      variant="outline"
                      className="flex items-center"
                      onClick={(e) => handleRestrictedAction(e, "/graph")}
                    >
                      <GanttChart className="mr-2" />
                      <span>See Graph</span>
                    </Button>
                    <p className="text-sm text-gray-600 w-2/3">
                      Visualize the document timeline and storyline with an intuitive graph.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                                    style={{ minWidth: "200px" }}

                      variant="outline"
                      className="flex items-center"
                      onClick={(e) => handleRestrictedAction(e, "/addResources")}
                    >
                      <Folder className="mr-2" />
                      <span>See Resources</span>
                    </Button>
                    <p className="text-sm text-gray-600 w-2/3">
                      View or upload related files associated with documents for better context.
                    </p>
                  </div>
                </>
              )}
            </div>
        {!user && <LoginForm />}
        {user && <UserProfileCard user={user} />}
          </CardContent>

        </Card>



        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%" }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default HomePage;
