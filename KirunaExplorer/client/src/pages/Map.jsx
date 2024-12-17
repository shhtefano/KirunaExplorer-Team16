import { Button } from "@/components/ui/button";

import GeneralMap from "../components/GeneralMap";

const MapPage = ({selectedDocumentId}) => {
  return (
    <div className="flex-col h-full w-full items-center justify-center space-y-6">

      <div className="flex mt-4">
        <GeneralMap selectedDocumentId={selectedDocumentId}/>
      
      </div>
      {/* <div className="flex items-center justify-center align-center">
        <a href="/">

          <Button variant="outline">Back to Home</Button>
        </a>
      </div> */}
    </div>
  );
};

export default MapPage;
