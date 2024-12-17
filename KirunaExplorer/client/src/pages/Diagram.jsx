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
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

const nodeTypes = {
  node: Node,
};

export default function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [newLinkData, setNewLinkData] = useState({ source: null, target: null, type: "" });
  const [linkError, setLinkError] = useState("");
  const [hoveredDocument, setHoveredDocument] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null); // Added state for hovered edge

  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 }); // Posizione del mouse

  const handleEdgeMouseEnter = (event, edge) => {
    const mouseX = event.pageX;
    const mouseY = event.pageY;
  
    console.log("Mouse X (page):", mouseX, "Mouse Y (page):", mouseY);
  
    setHoveredEdge(edge);
    setPopupPosition({ x: mouseX, y: mouseY });
  
    console.log("Popup position set (page):", { x: mouseX, y: mouseY });
  };
  
  

  const handleEdgeMouseLeave = () => {
    setHoveredEdge(null);
  };
  const transformDocumentsToNodes = (documents) => {
    const sortedDocs = [...documents].sort((a, b) => {
      if (!a.issuance_date) return 1;
      if (!b.issuance_date) return -1;
      return (a.issuance_date?.toString() || "").localeCompare(
        b.issuance_date?.toString() || ""
      );
    });

    const groupedByDate = sortedDocs.reduce((acc, doc) => {
      const date = doc.issuance_date || "no_date";
      if (!acc[date]) acc[date] = [];
      acc[date].push(doc);
      return acc;
    }, {});

    const nodes = [];
    let xPos = 0;

    Object.entries(groupedByDate).forEach(([date, docs]) => {
      docs.forEach((doc, index) => {
        const yPos = index * 150;

        nodes.push({
          id: doc.document_title,
          type: "node",
          position: { x: xPos, y: yPos + 100 },
          data: {
            label: doc.document_title,
            id: doc.document_id,
            type: doc.document_type,
            date: doc.issuance_date,
          },
        });
      });
      xPos += 300;
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
        const blockingNodes = adjustedNodes.filter(
          (node) =>
            node.position.x > sourceNode.position.x &&
            node.position.x < targetNode.position.x &&
            node.position.y === sourceNode.position.y
        );

        if (blockingNodes.length > 0) {
          targetNode.position.y += 200;
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
    (connection) => {
      const existingEdge = edges.find(
        (edge) => edge.source === connection.source && edge.target === connection.target
      );

      if (existingEdge) {
        setEdges((edges) => addEdge(connection, edges));
      } else {
        setNewLinkData({ source: connection.source, target: connection.target, type: "" });
        setShowLinkPopup(true);
      }
    },
    [edges]
  );

  const handleCreateLink = async () => {
    if (!newLinkData.type) {
      setLinkError("Please select a link type.");
      return;
    }
  
    // Call the API to link documents
    const response = await API.linkDocuments(newLinkData.source, newLinkData.target, newLinkData.type);
    
    if (response.success) {
      // If successful, create the new edge and update the edges state
      const newEdge = {
        id: `${newLinkData.source}-${newLinkData.target}-${newLinkData.type}`,
        source: newLinkData.source,
        target: newLinkData.target,
        label: newLinkData.type,
        animated: true,
        style: { stroke: "#333", strokeWidth: 2 },
        labelStyle: { fill: "#333", fontSize: 12 },
      };
  
      setEdges((edges) => [...edges, newEdge]);
      setShowLinkPopup(false);
      setNewLinkData({ source: null, target: null, type: "" });
      setLinkError("");
    } else {
      // If the API call fails, show the error message
      setLinkError(response.message || "Failed to create link.");
    }
  };
  

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
          onEdgeMouseEnter={handleEdgeMouseEnter} 
          onEdgeMouseLeave={handleEdgeMouseLeave} 
          fitView
          direction="LR"
        >
          <ViewportPortal>
            <div
              style={{
                position: "absolute",
                transform: "translate(0px, 50px)",
                width: "10000px",
                height: "2px",
                backgroundColor: "#ddd",
                zIndex: 1,
              }}
            />
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

          {/*show hov ered connection type */}
          {hoveredEdge && (
            <div
            style={{
              position: "absolute",
              top: 100,
              left:100,
              padding: "5px 10px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
              zIndex: 100,  // Aumenta il valore di zIndex per garantire che sia sopra ad altri elementi
              fontSize: "14px",
            }}
          >
            <strong>Connection Type:</strong> {hoveredEdge.label}
          </div>
          
          )}

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

      {showLinkPopup && (
        <Card className="min-w-[300px] max-w-[400px] mx-auto">
          <CardHeader>
            <CardTitle>Create Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the type of link to create between the selected nodes.
              </p>
              <Select
                onValueChange={(value) => setNewLinkData({ ...newLinkData, type: value })}
                value={newLinkData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select link type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Collateral Consequence">Collateral Consequence</SelectItem>
                  <SelectItem value="Projection">Projection</SelectItem>
                  <SelectItem value="Material Effects">Material Effects</SelectItem>
                  <SelectItem value="Direct Consequence">Direct Consequence</SelectItem>
                </SelectContent>
              </Select>
              {linkError && <p className="text-red-500 text-sm">{linkError}</p>}
              <div className="flex space-x-2">
                <Button onClick={handleCreateLink} disabled={!newLinkData.type}>
                  Create Link
                </Button>
                <Button variant="outline" onClick={() => setShowLinkPopup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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

