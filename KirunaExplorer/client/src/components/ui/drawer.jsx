import * as React from "react";
import { cn } from "@/lib/utils"; 

const Drawer = ({ isOpen, onClose, children, title }) => {
  return (
    <>
      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 w-full bg-background shadow-lg transition-transform transform",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full p-4">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
              aria-label="Close drawer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export { Drawer };
