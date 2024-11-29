import { Button } from "@/components/ui/button";

import GeneralMap from "../components/GeneralMap";

const MapPage = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center space-y-6">
      <div className="d-flex justify-content-center" style={{ fontSize: "34px", fontWeight: "bold", marginBottom: '20px', paddingTop: '20px' }}>
        <h1>
          Kiruna Map
        </h1>
      </div>

      <div className="flex pt-2 ">
        <GeneralMap/>
      
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
