import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, GanttChart } from "lucide-react";


const HomePage = () => {
  return (
    <div className="flex flex-col w-full h-full items-center justify-start p-5 mt-0 space-y-4">
      <Card className="min-w-[270px] max-w-[600px]">
        <CardHeader>
          <CardTitle>Kiruna Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          Welcome to Kiruna Explorer. Here we will create the webapp for
          exploring the incredible project of moving the swedish city, Kiruna.
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-x-2 justify-center items-center">
            <a href="/map">
              <Button variant="outline" className="mr-2">
                See Map
                <Map />
              </Button>
            </a>
            <a href="/graph">
              <Button variant="outline" className="mr-2">
                See graph
                <GanttChart />
              </Button>
            </a>
          </div>
        </CardFooter>
      </Card>
      
    </div>
  );
};

export default HomePage;
