import { Handle, Position } from "@xyflow/react";

export function Node({ data }) {
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.id && <div>{data.id}</div>}
      {data.label && <div>{data.label}</div>}
      {data.date && <div>{data.date}</div>}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
