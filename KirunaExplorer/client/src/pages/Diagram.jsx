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
  const [showDeletePopup, setShowDeletePopup] = useState(false); 
  const [edgeToDelete, setEdgeToDelete] = useState(null);       
  const [newLinkData, setNewLinkData] = useState({ source: null, target: null, type: "" });
  const [linkError, setLinkError] = useState("");
  const [isEdgeDeleted, setIsEdgeDeleted] = useState(false); 



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
  }, [isEdgeDeleted]);

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

  const onEdgeClick = (event, edge) => {
    setEdgeToDelete(edge);     
    setShowDeletePopup(true);  
  };
  

  const handleCreateLink = async () => {
    if (!newLinkData.type) {
      setLinkError("Please select a link type.");
      return;
    }
  
    const response = await API.linkDocuments(newLinkData.source, newLinkData.target, newLinkData.type);
    
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
          console.error("Errore nella cancellazione dell'edge:", response.message);
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
        {showDeletePopup && (
  <Card className="min-w-[300px] max-w-[400px] mx-auto">
    <CardHeader>
      <CardTitle>Delete Link</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Are you sure you want to delete this link?</p>
      <div className="flex space-x-2 mt-4">
        <Button onClick={handleDeleteEdge} variant="destructive">
          Delete
        </Button>
        <Button variant="outline" onClick={() => setShowDeletePopup(false)}>
          Cancel
        </Button>
      </div>
    </CardContent>
  </Card>
)}
    </ResizablePanelGroup>
  );
}
