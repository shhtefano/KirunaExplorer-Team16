import { ViewportPortal } from "@xyflow/react";
import { typeColors } from "./types";

const Legend = () => {
  return (
    <ViewportPortal>
      <div
        style={{
          position: "absolute",
          transform: "translate(0px, -250px)",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          padding: "1rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 className="text-sm font-semibold mb-2">Document Types</h3>
        <div className="flex flex-col gap-2">
          {Object.entries(typeColors).map(
            ([type, color]) =>
              type !== "default" && (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color}`} />
                  <span className="text-xs text-gray-600">{type}</span>
                </div>
              )
          )}
        </div>
      </div>
    </ViewportPortal>
  );
};

export default Legend;
