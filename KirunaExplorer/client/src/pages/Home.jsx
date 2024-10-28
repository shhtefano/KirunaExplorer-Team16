import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Map, Microwave } from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex w-full h-full items-center justify-center p-5">
      <Card className="min-w-[270px] max-w-[600px]">
        <CardHeader>
          <CardTitle>Kiruna Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          Welcome to Kiruna Explorer. Here we will create the webapp for
          exploring the incredible project of moving the swedish city, Kiruna.
        </CardContent>
        <CardFooter className="flex justify-between">
          <a href="/map">
            <Button variant="outline" className="mr-2">
              See Map
              <Map />
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={() => {
              toast.success("Created Kiruna Event", {
                description: "Sunday, November 01, 2024 at 9:00 AM",
                action: {
                  label: "Undo",
                  onClick: () => console.log("Undo"),
                },
              });
            }}
          >
            <Microwave className="text-zinc-600" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
