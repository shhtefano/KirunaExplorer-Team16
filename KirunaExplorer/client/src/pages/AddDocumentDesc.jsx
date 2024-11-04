import DocumentDescriptionForm from "@/components/document-description-form";
import DocumentLink from "@/components/document-link";
const AddDocumentDescPage = () => {
  return (
    <main className="w-full h-full flex items-center justify-center pt-12 p-8 gap-x-8">
      <DocumentDescriptionForm />
      <div className="w-1/2 h-full">
      <DocumentLink/>
      </div>
    </main>
  );
};

export default AddDocumentDescPage;
