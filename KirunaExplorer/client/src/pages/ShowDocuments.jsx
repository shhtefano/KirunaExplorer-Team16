import { Button } from "@/components/ui/button";
import DocsTable from "../components/documents-table";

const ShowDocumentsPage = () => {
  return (
    <div className="flex-col h-full w-full items-center justify-center p-3 space-y-4 mt-4">
      {/* <h1 className="text-center font-semibold text-lg">
        List of All Documents
      </h1> */}
      <div className="flex items-center justify-center align-center">
        <DocsTable/>
      </div>
    </div>
  );
};

export default ShowDocumentsPage;
