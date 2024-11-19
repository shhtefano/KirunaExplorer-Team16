import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, GanttChart } from "lucide-react";
import LoginForm from "@/components/login-form";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full h-full items-center justify-start p-5 mt-0 space-y-4 text-center">
      <Card className="min-w-[270px] max-w-[800px]">
        <CardHeader>
          <CardTitle>Kiruna Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          Welcome to Kiruna Explorer. Here we will create the webapp for
          exploring the incredible project of moving the swedish city, Kiruna.
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-x-2 justify-center items-center">
            <a href="/add-document-description">
              <Button variant="outline" className="mr-2">
                Add doc
                <Map data-testid="map-icon" />
              </Button>
            </a>
            <a href="/documents/link">
              <Button variant="outline" className="mr-2">
                Link doc
                <Map />
              </Button>
            </a>
            <a href="/documents">
              <Button variant="outline" className="mr-2">
                See docs
                <Map />
              </Button>
            </a>
            <a href="/map">
              <Button variant="outline" className="mr-2">
                See Map
                <Map />
              </Button>
            </a>
            <a href="/graph">
              <Button variant="outline" className="mr-2">
                See graph
                <GanttChart data-testid="gantt-chart-icon" />
              </Button>
            </a>
          </div>
        </CardFooter>
      </Card>
      {!user && <LoginForm />}
      {user && (
        <Card className="min-w-[270px] max-w-[800px] w-full mt-4">
          <CardHeader>
            <CardTitle>
              Welcome back {user.username}! - Your role is: {user.role}
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
