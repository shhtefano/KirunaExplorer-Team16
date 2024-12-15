import { PositionLoggerNode } from "./PositionLoggerNode";
import { Node } from "./Node";

// Nodes
export const initialNodes = [
  {
    id: "a",
    type: "node",
    position: { x: 0, y: 0 },
    data: { label: "Document 1" },
  },
  {
    id: "b",
    type: "node",
    position: { x: 200, y: -100 }, // Adjusted x position
    data: { label: "Kiruna LKB", id: "1" },
  },
  {
    id: "c",
    type: "node",
    position: { x: 200, y: 100 }, // Adjusted x position
    data: { label: "Document 2", id: "2" },
  },
  {
    id: "d",
    type: "position-logger",
    position: { x: 400, y: 0 }, // Adjusted x position
    data: { label: "Document 3" },
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  node: Node,
};

// Edges remain the same
export const initialEdges = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d" },
  { id: "c->d", source: "c", target: "d", animated: true },
];

export const edgeTypes = {};
