import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  ViewportPortal,
  ControlButton,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import API from "../services/API";
import { Node } from "../components/nodes/Node";
import MapPage from "./Map";

const nodeTypes = {
  node: Node,
};

export default function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const transformDocumentsToNodes = (documents) => {
    // Basic sorting by date
    const sortedDocs = [...documents].sort((a, b) => {
      if (!a.issuance_date) return 1; // No date goes to end
      if (!b.issuance_date) return -1; // No date goes to end
      return a.issuance_date.localeCompare(b.issuance_date);
    });

    console.log("Sorted documents:", sortedDocs);

    // Transform to nodes with positions
    return sortedDocs.map((doc, index) => {
      const xPos = index * 200; // Horizontal spacing
      const yPos = 0; // All on same row for now

      console.log(`Creating node for ${doc.document_title} at position:`, {
        x: xPos,
        y: yPos,
      });

      return {
        id: doc.document_title,
        type: "node",
        position: { x: xPos, y: yPos },
        data: {
          label: doc.document_title,
          id: doc.document_id,
          type: doc.type_name,
          date: doc.issuance_date,
        },
      };
    });
  };

  const transformConnectionsToEdges = (connections) => {
    return connections.map((conn) => {
      const uniqueId = `${conn.parent_id}-${conn.children_id}-${
        conn.connection_type
      }-${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: uniqueId,
        source: conn.parent_id,
        target: conn.children_id,
        label: conn.connection_type || "",
        animated: true,
        style: { stroke: "#333", strokeWidth: 2 },
        labelStyle: { fill: "#333", fontSize: 12 },
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const documents = await API.getDocuments();
        console.log("Documents:", documents);

        const documentNodes = transformDocumentsToNodes(documents);
        console.log("Nodes:", documentNodes);
        setNodes(documentNodes);

        const allConnections = [];
        for (const doc of documents) {
          const response = await API.getConnectionsByDocumentTitle(
            doc.document_title
          );
          if (response.success && response.data) {
            allConnections.push(...response.data);
          }
        }

        console.log("Connections:", allConnections);
        const documentEdges = transformConnectionsToEdges(allConnections);
        console.log("Edges:", documentEdges);
        setEdges(documentEdges);
      } catch (error) {
        console.error("Error fetching diagram data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  if (loading) {
    return <div>Loading diagram...</div>;
  }

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>
        <MapPage />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          direction="LR"
        >
          <ViewportPortal>
            {/* Timeline line */}
            <div
              style={{
                position: "absolute",
                transform: "translate(0px, 150px)",
                width: "100%",
                height: "2px",
                backgroundColor: "#ddd",
                zIndex: -1,
              }}
            />

            {/* Timeline markers and dates */}
            <div
              style={{
                position: "absolute",
                transform: "translate(0px, 160px)",
                display: "flex",
                gap: "200px",
              }}
            >
              {nodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    transform: `translate(${node.position.x}px, 0px)`,
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "#666",
                  }}
                >
                  <div
                    style={{
                      width: "2px",
                      height: "10px",
                      backgroundColor: "#ddd",
                      marginBottom: "5px",
                    }}
                  />
                  <div style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                    {node.data.date || "No date"}
                  </div>
                </div>
              ))}
            </div>
          </ViewportPortal>
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
// import { useCallback, useEffect, useState } from "react";
// import {
//   Background,
//   Controls,
//   MiniMap,
//   ReactFlow,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   BackgroundVariant,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import API from "../services/API";
// import { Node } from "../components/nodes/Node";

// const nodeTypes = {
//   node: Node,
// };

// export default function Diagram() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [loading, setLoading] = useState(true);

//   const transformDocumentsToNodes = (documents) => {
//     return documents
//       .map((doc, index) => {
//         if (!doc || !doc.document_id || !doc.document_title) {
//           console.warn("Invalid document structure:", doc);
//           return null;
//         }

//         return {
//           id: doc.document_title, // Use title as ID since connections reference titles
//           type: "node",
//           position: { x: index * 200, y: index * 100 },
//           data: {
//             label: doc.document_title,
//             id: doc.document_id,
//           },
//         };
//       })
//       .filter(Boolean);
//   };

//   const transformConnectionsToEdges = (connections) => {
//     return connections
//       .map((conn) => {
//         if (!conn || !conn.parent_id || !conn.children_id) {
//           console.warn("Invalid connection structure:", conn);
//           return null;
//         }

//         return {
//           id: `${conn.parent_id}-${conn.children_id}`,
//           source: conn.parent_id, // Use parent title directly
//           target: conn.children_id, // Use children title directly
//           label: conn.connection_type || "",
//           animated: true, // Make edges animated to highlight connections
//           style: { stroke: "#333", strokeWidth: 2 }, // Add some styling
//           labelStyle: { fill: "#333", fontSize: 12 }, // Style the connection type label
//         };
//       })
//       .filter(Boolean);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // Fetch all documents
//         const documents = await API.getDocuments();
//         console.log("Documents:", documents);

//         // Convert documents to nodes
//         const documentNodes = transformDocumentsToNodes(documents);
//         console.log("Nodes:", documentNodes);
//         setNodes(documentNodes);

//         // For each document, fetch its connections
//         const allConnections = [];
//         for (const doc of documents) {
//           const response = await API.getConnectionsByDocumentTitle(
//             doc.document_title
//           );
//           if (response.success && response.data) {
//             allConnections.push(...response.data);
//           }
//         }

//         console.log("Connections:", allConnections);

//         // Convert connections to edges
//         const documentEdges = transformConnectionsToEdges(allConnections);
//         console.log("Edges:", documentEdges);
//         setEdges(documentEdges);
//       } catch (error) {
//         console.error("Error fetching diagram data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const onConnect = useCallback(
//     (connection) => setEdges((edges) => addEdge(connection, edges)),
//     [setEdges]
//   );

//   if (loading) {
//     return <div>Loading diagram...</div>;
//   }

//   return (
//     <ReactFlow
//       nodes={nodes}
//       nodeTypes={nodeTypes}
//       onNodesChange={onNodesChange}
//       edges={edges}
//       onEdgesChange={onEdgesChange}
//       onConnect={onConnect}
//       fitView
//       direction="LR"
//     >
//       <Background variant={BackgroundVariant.Dots} />
//       <MiniMap />
//       <Controls />
//     </ReactFlow>
//   );
// }

// heeeeeeeelp-------------------
// import { useCallback } from "react";
// import {
//   Background,
//   Controls,
//   MiniMap,
//   ReactFlow,
//   addEdge,
//   useNodesState,
//   useEdgesState,
// } from "@xyflow/react";

// import "@xyflow/react/dist/style.css";

// import { initialNodes, nodeTypes } from "../components/nodes/index";
// import { initialEdges, edgeTypes } from "../components/nodes/index";

// export default function Diagram() {
//   const [nodes, , onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
//   const onConnect = useCallback(
//     (connection) => setEdges((edges) => addEdge(connection, edges)),
//     [setEdges]
//   );

//   return (
//     <ReactFlow
//       nodes={nodes}
//       nodeTypes={nodeTypes}
//       onNodesChange={onNodesChange}
//       edges={edges}
//       edgeTypes={edgeTypes}
//       onEdgesChange={onEdgesChange}
//       onConnect={onConnect}
//       fitView
//       direction="LR"
//     >
//       <Background />
//       <MiniMap />
//       <Controls />
//     </ReactFlow>
//   );
// }
