import DocumentDescriptionForm from "@/components/document-description-form";

const AddDocumentDescPage = () => {
  return (
    <main className="w-full h-full flex items-center justify-center pt-12 p-8 gap-x-8">
      <DocumentDescriptionForm />
      <div className="w-1/2 h-full">
        Maybe your component here, Martha? Or a new page
      </div>
    </main>
  );
};

export default AddDocumentDescPage;
