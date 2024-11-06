const SERVER_URL = "http://localhost:3001";
async function getDocuments() {
  const response = await fetch(`${SERVER_URL}/api/document/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getDocuments");
  }

  return response.json();
}

// async function linkDocuments(parent_id,children_id, connection_type) {
//   const response = await fetch(`${SERVER_URL}/api/document/connections`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       parent_id,
//        children_id,
//         connection_type
//     }),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.message || "Errore API linkDocuments");
//   }

//   return response.json();
// }

async function linkDocuments(parent_id, children_id, connection_type) {
  try {
    const response = await fetch(`${SERVER_URL}/api/document/connections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent_id,
        children_id,
        connection_type,
      }),
    });

    // Handle non-successful response cases
    if (!response.ok) {
      // Clone the response to safely read it in multiple ways
      const responseClone = response.clone();

      // Try to parse the error response as JSON
      let errorMessage = "An unknown error occurred.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If parsing fails, use the cloned response to read text
        errorMessage = await responseClone.text();
      }

      // Return an error response
      return { success: false, message: errorMessage };
    }

    // Handle successful responses - safely attempt to parse as JSON if content exists
    let data;
    try {
      data = await response.json(); // Attempt to parse as JSON
    } catch (parseError) {
      data = null; // If no JSON body is present, set data to null or handle as needed
    }

    // Return success response with data (if available)
    return { success: true, data };
  } catch (error) {
    // Log and return an error response for unexpected errors
    console.error("Error in linkDocuments:", error);
    return {
      success: false,
      message: error.message || "An unknown error occurred.",
    };
  }
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
  } else if (res.status === 403) {
    return { error: "Document already exists." };
  }
  else if (res.status === 422) {
    return { error: "Missing Latitude/Longitude or Municipal area" };
  }
  else{
    return { error: "Server error" }; 
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
  addDocumentDescription,
  getDocuments,
};

export default API;
