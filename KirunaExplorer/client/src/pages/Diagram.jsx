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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

const nodeTypes = {
  node: Node,
};

export default function Diagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [edgeToDelete, setEdgeToDelete] = useState(null);
  const [newLinkData, setNewLinkData] = useState({
    source: null,
    target: null,
    type: "",
  });
  const [linkError, setLinkError] = useState("");
  const [isEdgeDeleted, setIsEdgeDeleted] = useState(false);

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

  const parseDateParts = (dateStr) => {
    if (!dateStr) return { year: -1, month: 1, day: 1 };

    const parts = dateStr.toString().trim().split("/");
    return {
      year: parts[0] ? parseInt(parts[0]) : -1,
      month: parts[1] ? parseInt(parts[1]) : 1,
      day: parts[2] ? parseInt(parts[2]) : 1,
    };
  };

  const compareDates = (date1, date2) => {
    if (!date1 && !date2) return 0;
    if (!date1) return 1;
    if (!date2) return -1;

    const parts1 = parseDateParts(date1);
    const parts2 = parseDateParts(date2);

    // First compare years
    if (parts1.year !== parts2.year) {
      return parts1.year - parts2.year;
    }

    // If both dates have just the year, consider them equal
    const hasOnlyYear1 = date1.toString().trim().split("/").length === 1;
    const hasOnlyYear2 = date2.toString().trim().split("/").length === 1;
    if (hasOnlyYear1 && hasOnlyYear2) return 0;

    // Year-only dates should come before more specific dates
    if (hasOnlyYear1) return -1;
    if (hasOnlyYear2) return 1;

    // Compare months
    if (parts1.month !== parts2.month) {
      return parts1.month - parts2.month;
    }

    // Compare days
    return parts1.day - parts2.day;
  };

  const transformDocumentsToNodes = (documents) => {
    // First sort the documents
    const sortedDocs = [...documents].sort((a, b) =>
      compareDates(a.issuance_date, b.issuance_date)
    );

    // Instead of using groupedByDate for layout, use the sorted order directly
    const nodes = [];
    let currentDate = null;
    let xPos = 0;
    let yOffset = 0;

    sortedDocs.forEach((doc, index) => {
      // If this is a new date, reset yOffset and increment xPos
      if (doc.issuance_date !== currentDate) {
        currentDate = doc.issuance_date;
        yOffset = 0;
        if (index > 0) {
          xPos += 300; // Space between date groups
        }
      }

      nodes.push({
        id: doc.document_title,
        type: "node",
        position: { x: xPos, y: yOffset + 100 },
        data: {
          label: doc.document_title,
          id: doc.document_id,
          type: doc.document_type,
          date: doc.issuance_date,
        },
      });

      yOffset += 150; // Vertical spacing between nodes of the same date
    });

    // Debug log to verify node positions
    console.log(
      "Node positions:",
      nodes.map((node) => ({
        title: node.id,
        date: node.data.date,
        x: node.position.x,
        y: node.position.y,
      }))
    );

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
          const response = await API.getConnectionsByDocumentTitle(
            doc.document_title
          );
          if (response.success && response.data) {
            allConnections.push(...response.data);
          }
        }

        const documentEdges = transformConnectionsToEdges(allConnections);
        const resolvedNodes = adjustNodePositionsForLinks(
          documentNodes,
          documentEdges
        );

        setNodes(resolvedNodes);
        setEdges(documentEdges);
      } catch (error) {
        console.error("Error fetching diagram data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdgeDeleted]);

  const onConnect = useCallback(
    (connection) => {
      const existingEdge = edges.find(
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );

      if (existingEdge) {
        setEdges((edges) => addEdge(connection, edges));
      } else {
        setNewLinkData({
          source: connection.source,
          target: connection.target,
          type: "",
        });
        setShowLinkPopup(true);
      }
    },
    [edges]
  );

  const onEdgeClick = (event, edge) => {
    setEdgeToDelete(edge);
    setShowDeletePopup(true);
  };

  const handleCreateLink = async () => {
    if (!newLinkData.type) {
      setLinkError("Please select a link type.");
      return;
    }

    const response = await API.linkDocuments(
      newLinkData.source,
      newLinkData.target,
      newLinkData.type
    );

    if (response.success) {
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
      setLinkError(response.message || "Failed to create link.");
    }
  };

  const handleDeleteEdge = async () => {
    if (edgeToDelete && !isEdgeDeleted) {
      const { source, target, label } = edgeToDelete;

      setIsEdgeDeleted(true);

      try {
        const response = await API.deleteConnection(source, target, label);

        if (response.success) {
          console.log("Cancellazione avvenuta correttamente");

          setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete.id));
          setEdgeToDelete(null);
          setShowDeletePopup(false);
        } else {
          console.error(
            "Errore nella cancellazione dell'edge:",
            response.message
          );
        }
      } catch (error) {
        console.error("Errore nella chiamata API:", error);
      } finally {
        setIsEdgeDeleted(false); // Reset della flag dopo il completamento
      }
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
    <ResizablePanelGroup direction="vertical" data-testid="diagram-panel-group">
      <ResizablePanel data-testid="map-panel">
        <MapPage selectedDocumentId={selectedDocumentId} />
      </ResizablePanel>
      <ResizableHandle withHandle={true} data-testid="resize-handle" />
      <ResizablePanel data-testid="diagram-panel">
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
          onEdgeClick={onEdgeClick}
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
        <Card
          className="min-w-[300px] max-w-[400px] mx-auto"
          data-testid="create-link-popup"
        >
          <CardHeader>
            <CardTitle>Create Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the type of link to create between the selected nodes.
              </p>
              <Select
                onValueChange={(value) =>
                  setNewLinkData({ ...newLinkData, type: value })
                }
                value={newLinkData.type}
                data-testid="link-type-selector"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select link type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Collateral Consequence">
                    Collateral Consequence
                  </SelectItem>
                  <SelectItem value="Projection">Projection</SelectItem>
                  <SelectItem value="Material Effects">
                    Material Effects
                  </SelectItem>
                  <SelectItem value="Direct Consequence">
                    Direct Consequence
                  </SelectItem>
                </SelectContent>
              </Select>
              {linkError && <p className="text-red-500 text-sm">{linkError}</p>}
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateLink}
                  disabled={!newLinkData.type}
                  data-testid="create-link-button"
                >
                  Create Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLinkPopup(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {showDeletePopup && (
        <Card
          className="min-w-[300px] max-w-[400px] mx-auto"
          data-testid="delete-link-popup"
        >
          <CardHeader>
            <CardTitle>Delete Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Are you sure you want to delete this link?</p>
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handleDeleteEdge}
                variant="destructive"
                data-testid="delete-link-button"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </Button>
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
        maxWidth: "400px",
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
        <strong>Stakeholders:</strong>{" "}
        {document.stakeholders.length > 0
          ? document.stakeholders.join(", ")
          : "N/A"}
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
