const SERVER_URL = "http://localhost:3001";


async function linkDocuments(node1_id, node2_id, connection_type = "Update") {
  const response = await fetch(`${SERVER_URL}/api/document/connections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      node1_id,
      node2_id,
      connection_type,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API linkDocuments");
  }

  return response.json();
}
/* example
async function fetchServices() {
  const response = await fetch(SERVER_URL + "/api/services", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Se necessario per la sessione
  });

  if (!response.ok) {
    throw new Error("Errore API fetchServices");
  }

  const services = await response.json();
  return services;
}

*/
const API = {
  linkDocuments,
};


export default API;