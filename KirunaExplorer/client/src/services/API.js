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



const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + "/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const addDocumentDescription = async (body) => {
  const res = await fetch(SERVER_URL + "/api/document", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    return res.status;
  } else {
    return res.status;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + "/api/sessions/current", {
    credentials: "include",
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;
  }
};

const logOut = async () => {
  const response = await fetch(SERVER_URL + "/api/sessions/current", {
    method: "DELETE",
    credentials: "include",
  });
  if (response.ok) return null;
};

const API = {
  logIn,
  getUserInfo,
  logOut,
  linkDocuments,
  addDocumentDescription};

export default API;
