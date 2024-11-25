import { Button } from "@/components/ui/button";

const GraphPage = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center p-4 space-y-6">
      <div className="d-flex justify-content-center" style={{ fontSize: "34px", fontWeight: "bold", marginBottom: '20px' }}>
        <h1>
          Document Graph
        </h1>
      </div>
      <div className="flex items-center justify-center">
        <a href="/">
          <Button variant="outline">Back to Home</Button>
        </a>
      </div>
    </div>
  );
};

export default GraphPage;
