import { Handle, Position } from "@xyflow/react";

const typeColors = {
  Design: "bg-amber-100",
  Informative: "bg-blue-100",
  Technical: "bg-green-100",
  Prescriptive: "bg-purple-100",
  "Material Effects": "bg-red-100",
  Agreement: "bg-teal-100",
  Conflict: "bg-slate-100",
  default: "bg-white",
};

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
