import { Button } from "@/components/ui/button";

import DrawMap from "../components/DrawMap";

const MapPage = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center space-y-6">
      <h1 className="text-center font-semibold text-lg">
        Kiruna Map
      </h1>

      <div className="flex p-4 ">
        <DrawMap/>
      
      </div>
      <div className="flex items-center justify-center align-center">
        <a href="/">

          <Button variant="outline">Back to Home</Button>
        </a>
      </div>
    </div>
  );
};

export default MapPage;
