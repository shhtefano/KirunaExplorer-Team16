import { Handle, Position } from "@xyflow/react";
import { typeColors } from "./types";

export function Node({ data }) {
  const bgColorClass = typeColors[data.type] || typeColors.default;
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className={`react-flow__node-default ${bgColorClass}`}>
      {data.id && <div>{data.id}</div>}
      {data.label && <div>{data.label}</div>}
      {data.date && <div>{data.date}</div>}
      {data.type && <div>{data.type}</div>}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
