import { Toaster } from "@/components/ui/sonner";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom"; // Importa useLocation per ottenere l'URL corrente
export function Providers({ children }) {
  const location = useLocation();

  // Mappa dei titoli in base agli URL
  const pageTitles = {
    "/": "Dashboard",
    "/map": "Map",
    "/areas": "Areas",
    "/graph": "Graph",
    "/add-document-description": "New Document",
    "/documents/list": "Show Documents",
    "/addResources": "Resources Management",
  };

  // Titolo corrente in base all'URL
  const currentPageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <>
      <AuthProvider>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {/* Inserisci qui il titolo della pagina */}
                <span className="font-semibold text-lg">

                <a href="/" className="">
                <u>
                  <i>

                Home
                  </i>


                </u>
                </a>
                { " >"}
                </span>
                <span className=" text-lg"> <strong><i>{currentPageTitle}</i> </strong></span>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </AuthProvider>
    </>
  );
}
