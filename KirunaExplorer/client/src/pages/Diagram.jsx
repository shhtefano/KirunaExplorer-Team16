// src/pages/Diagram.jsx

import { useCallback, useEffect, useState } from "react";
import { ResetIcon } from "@radix-ui/react-icons";
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
import Legend from "@/components/nodes/Legend";

const nodeTypes = {
  node: Node,
};

export default function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [hoveredDocument, setHoveredDocument] = useState(null);

  const transformDocumentsToNodes = (documents) => {
    const sortedDocs = [...documents].sort((a, b) => {
      if (!a.issuance_date) return 1; 
      if (!b.issuance_date) return -1; 
      return (a.issuance_date?.toString() || "").localeCompare(
        b.issuance_date?.toString() || ""
      );
    });

    console.log("Sorted documents:", sortedDocs);

    // Group documents by date to make the view more clear
    const groupedByDate = sortedDocs.reduce((acc, doc) => {
      const date = doc.issuance_date || "no_date";
      if (!acc[date]) acc[date] = [];
      acc[date].push(doc);
      return acc;
    }, {});

    const nodes = [];
    let xPos = 0;

    // Transform to nodes with adjusted positions
    Object.entries(groupedByDate).forEach(([date, docs]) => {
      docs.forEach((doc, index) => {
        const yPos = index * 150; // Vertical spacing for documents with the same date

        console.log(`Creating node for ${doc.document_title} at position:`, {
          x: xPos,
          y: yPos,
        });

        nodes.push({
          id: doc.document_title,
          type: "node",
          position: { x: xPos, y: yPos + 100 }, // Offset for better spacing
          data: {
            label: doc.document_title,
            id: doc.document_id,
            type: doc.document_type,
            date: doc.issuance_date,
          },
        });
      });

      xPos += 300; // Increased horizontal spacing for better clarity
    });

    return nodes;
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

  const adjustNodePositionsForLinks = (nodes, edges) => {
    const adjustedNodes = [...nodes];
  
    edges.forEach((edge) => {
      const sourceNode = adjustedNodes.find((node) => node.id === edge.source);
      const targetNode = adjustedNodes.find((node) => node.id === edge.target);
  
      if (sourceNode && targetNode) {
        // Check if there are documents between them
        const blockingNodes = adjustedNodes.filter(
          (node) =>
            node.position.x > sourceNode.position.x &&
            node.position.x < targetNode.position.x &&
            node.position.y === sourceNode.position.y
        );
  
        if (blockingNodes.length > 0) {
          // If document are in the middle of the link -> Vertical shift
          targetNode.position.y += 200; // 200px vertical shift
        }
      }
    });
  
    return adjustedNodes;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const documents = await API.getDocuments();
        const documentNodes = transformDocumentsToNodes(documents);
        const allConnections = [];
  
        for (const doc of documents) {
          const response = await API.getConnectionsByDocumentTitle(doc.document_title);
          if (response.success && response.data) {
            allConnections.push(...response.data);
          }
        }
  
        const documentEdges = transformConnectionsToEdges(allConnections);
  
        // Aggiusta le posizioni dei nodi per rendere più chiari i collegamenti
        const resolvedNodes = adjustNodePositionsForLinks(documentNodes, documentEdges);
  
        setNodes(resolvedNodes);
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

  const handleNodeClick = (event, node) => {
    setSelectedDocumentId(node.data.id);
    console.log("Document clicked:", node.data.id);
  };
  const handleNodeMouseEnter = async (event, node) => {
    try {
      const documentId = node.data.label;
      const response = await API.getDocumentById(documentId);
  
      if (response.success && response.data) {
        const fullDocument = response.data;
        setHoveredDocument(fullDocument);
      }
    } catch (error) {
      console.error("Error fetching document details:", error);
    }
  };

  const handleNodeMouseLeave = () => {
    setHoveredDocument(null);
  };

  if (loading) {
    return <div>Loading diagram...</div>;
  }

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>
        <MapPage selectedDocumentId={selectedDocumentId} />
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
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          fitView
          direction="LR"
        >
          <ViewportPortal>
            {/* Timeline line */}
            <div
              style={{
                position: "absolute",
                transform: "translate(0px, 50px)",
                width: "10000px", // To make timeline longer
                height: "2px",
                backgroundColor: "#ddd",
                zIndex: 1, // Ensure it is above nodes
              }}
            />

            {/* Timeline markers and dates */}
            <div
              style={{
                position: "absolute",
                transform: "translate(0px, 30px)",
                display: "flex",
                gap: "300px",
              }}
            >
              {nodes.map((node, index) => (
                <div
                  key={`timeline-${index}`}
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
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      fontWeight: "bold",
                    }}
                  >
                    {node.data.date || "No date"}
                  </div>
                </div>
              ))}
            </div>
          </ViewportPortal>

          {/* Usa il componente DocumentInfo per visualizzare i dettagli del documento hoverato */}
          <DocumentInfo document={hoveredDocument} />

          <Legend />
          <Background />
          <MiniMap />
          <Controls>
            <ControlButton>
              <ResetIcon />
            </ControlButton>
          </Controls>
        </ReactFlow>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// src/components/nodes/DocumentInfo.jsx

export const DocumentInfo = ({ document }) => {
  if (!document) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        padding: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        maxWidth: "300px",
        fontSize: "12px",
      }}
    >
      <p style={{ marginBottom: "10px" }}>
        <strong>Title:</strong> {document.document_title}
      </p>
      <p style={{ marginBottom: "10px" }}>
        <strong>Document Type:</strong> {document.document_type}
      </p>
      <p style={{ marginBottom: "10px" }}>
        <strong>Stakeholders:</strong> {document.stakeholders.length > 0 ? document.stakeholders.join(', ') : 'N/A'}
      </p>
      <p style={{ marginBottom: "10px" }}>
        <strong>Date:</strong> {document.issuance_date}
      </p>
      <p style={{ marginBottom: "10px" }}>
        <strong>Scale:</strong> {document.scale}
      </p>
      {document.language && (
        <p style={{ marginBottom: "10px" }}>
          <strong>Language:</strong> {document.language}
        </p>
      )}
      {document.pages && (
        <p style={{ marginBottom: "10px" }}>
          <strong>Pages:</strong> {document.pages}
        </p>
      )}
      <p style={{ marginBottom: "10px" }}>
        <strong>Description:</strong> {document.document_description}
      </p>
    </div>
  );
};

