import { Button } from "@/components/ui/button";

const GraphPage = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center p-4 space-y-6">
      <h1 className="text-center font-semibold text-lg">
        This is the graph page
      </h1>
      <div className="flex items-center justify-center">
        <a href="/">
          <Button>Back to Home</Button>
        </a>
      </div>
    </div>
  );
};

export default GraphPage;
