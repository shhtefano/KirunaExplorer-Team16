import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, GanttChart, User } from "lucide-react";
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
    <div className="relative min-h-screen w-full">
      {/* Background Image with Overlay */}
      <div
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${kirunaImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay to improve content readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col w-full h-full items-center justify-start p-5 mt-0 space-y-4 text-center" >
        <Card className="min-w-[270px] max-w-[800px] bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Kiruna Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            Welcome to Kiruna Explorer. Here we will create the webapp for
            exploring the incredible project of moving the swedish city, Kiruna.
          </CardContent>
          {/* Conditional rendering of the buttons based on the role */}
          <CardFooter className="flex justify-between justify-center">
            <div className="flex gap-x-2 justify-center items-center">
              {user?.role === "urban_planner" && (
                <>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={(e) =>
                      handleRestrictedAction(e, "/add-document-description")
                    }
                  >
                    Add doc
                    <Map data-testid="map-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={(e) => handleRestrictedAction(e, "/documents/list")}
                  >
                    See docs
                    <Map />
                  </Button>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={(e) => handleRestrictedAction(e, "/graph")}
                  >
                    See graph
                    <GanttChart data-testid="gantt-chart-icon" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => navigate("/map")}
              >
                See Map
                <Map />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {!user && <LoginForm />}

        {user && <UserProfileCard user={user} />}

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
