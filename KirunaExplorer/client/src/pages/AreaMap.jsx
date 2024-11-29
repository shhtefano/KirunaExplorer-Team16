import { Button } from "@/components/ui/button";

import DrawMap from "../components/DrawMap";

const AreaMap = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center space-y-6">
      <div className="d-flex justify-content-center" style={{ fontSize: "34px", fontWeight: "bold", marginBottom: '20px', paddingTop: '20px' }}>
        <h1>
          Area Map
        </h1>
      </div>
      <div style={{marginBottom:'20px'}}>
        <div>

      <DrawMap/>
        </div>
        <div className="flex items-center justify-center align-center" style={{marginTop:'90px'}}>
          <a href="/">

            <Button variant="outline">Back to Home</Button>
          </a>
        </div>
      </div>

    </div>
  );
};

export default AreaMap;
