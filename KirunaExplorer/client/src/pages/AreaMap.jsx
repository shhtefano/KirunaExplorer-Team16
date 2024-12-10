import { Button } from "@/components/ui/button";

import DrawMap from "../components/DrawMap";

const AreaMap = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center space-y-6">

      <div style={{marginTop:'20px', marginLeft:'20px'}}>
        <div>

      <DrawMap/>
        </div>
        {/* <div className="flex items-center justify-center align-center" style={{marginTop:'90px'}}>
          <a href="/">

            <Button variant="outline">Back to Home</Button>
          </a>
        </div> */}
      </div>

    </div>
  );
};

export default AreaMap;
