import { Toaster } from "@/components/ui/sonner";

// All providers for ui goes here

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
