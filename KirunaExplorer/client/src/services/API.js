import { createClient } from '@supabase/supabase-js';
const SERVER_URL = "http://localhost:3001";

// Configura Supabase
const supabaseUrl = 'https://htbtahvbjarpdpzgzxug.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YnRhaHZiamFycGRwemd6eHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MTM0MDUsImV4cCI6MjA0ODQ4OTQwNX0.Vnj0lJX4pd-cplV1m3K6sVBqTkPOkQgWNrPmnrh1VLE'; // La chiave anonima
const supabase = createClient(supabaseUrl, supabaseKey);

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





async function deleteDocument(document_id) {
  const response = await fetch(`${SERVER_URL}/api/document/${document_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API error: Document deletion failed");
  }
  return response.json();
}







async function getStakeholders() {
  const response = await fetch(`${SERVER_URL}/api/stakeholder`, {
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

async function getDocumentsGeo() {
  const response = await fetch(`${SERVER_URL}/api/document/geo/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getDocuments");
  }

  const data = await response.json();

  return data;
}

async function getGeoArea() {
  const response = await fetch(`${SERVER_URL}/api/document/geo/area`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getDocuments");
  }

  const data = await response.json();

  return data;
}

async function deleteArea(areaName) {
  const response = await fetch(`${SERVER_URL}/api/geo/area`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      areaName
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getDocuments");
  } else {
    return true;
  }
}

async function getAreaCoordinates(area_id) {
  const response = await fetch(`${SERVER_URL}/api/geo/${area_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getAreaCoordinates");
  }

  const data = await response.json();

  return data;
}

async function getAreaByDocumentTitle(document_title) {
  try {
    // Effettua la chiamata API per ottenere l'area del documento tramite il suo titolo
    const response = await fetch(`${SERVER_URL}/api/document/title/${document_title}/area`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Gestisce eventuali errori HTTP
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Errore durante il recupero dell'area del documento");
    }

    // Se la risposta è valida, restituisce i dettagli dell'area
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
    return { success: false, message: error.message || "Errore di rete o server non raggiungibile." };
  }
}


async function updateDocumentCoordinates(document_id, lat, lng) {

  const response = await fetch(`${SERVER_URL}/api/document/updatePointCoords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id,
      lat,
      lng,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getDocuments");
  }

  const data = await response.json();

  return data;
}

async function updateDocumentArea(document_id, area_id) {

  const response = await fetch(`${SERVER_URL}/api/document/updateDocumentArea`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id,
      area_id
    }),
  });

  if (!response.ok) {

    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();

  return data;
}

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
      if (response.status === 403) {
        return { success: false, message: "Duplicated Link" };
      } else if (response.status === 500) {
        return { success: false, message: "Internal Server Error" };

      }
      // // Try to parse the error response as JSON
      // let errorMessage = "An unknown error occurred.";
      // try {
      //   const errorData = await response.json();
      //   errorMessage = errorData.message || errorMessage;
      // } catch (jsonError) {
      //   // If parsing fails, use the cloned response to read text
      //   errorMessage = await responseClone.text();
      // }

      // // Return an error response
      // return { success: false, message: errorMessage };
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


async function getConnectionsByDocumentTitle(title) {
  try {
    const response = await fetch(`${SERVER_URL}/api/document/connections/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    // Verifica se la risposta è ok
    if (!response.ok) {
      const responseClone = response.clone(); // Clona per leggere in modo sicuro
      console.error("Errore nella risposta:", responseClone);

      // Gestisce casi specifici di errore
      if (response.status === 400) {
        return { success: false, message: "Bad Request: Titolo mancante o non valido." };
      } else if (response.status === 500) {
        return { success: false, message: "Internal Server Error." };
      }

      return { success: false, message: `Errore sconosciuto: ${response.status}` };
    }

    // Converte la risposta in JSON
    const data = await response.json();

    // Ritorna i dati se la richiesta è andata a buon fine
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
    return { success: false, message: "Errore di rete o server non raggiungibile." };
  }
}

// Funzione per chiamare l'API e cancellare una connessione
const deleteConnection = async (doc1_id, doc2_id, connection_type) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/document/connections/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doc1_id, doc2_id, connection_type }),
    });

    // Verifica se la risposta è ok
    if (!response.ok) {
      const responseClone = response.clone();
      console.error("Errore nella risposta:", responseClone);

      // Gestisce i casi di errore specifici
      if (response.status === 400) {
        return { success: false, message: "Bad Request: Parametri mancanti o errati." };
      } else if (response.status === 500) {
        return { success: false, message: "Internal Server Error." };
      }

      return { success: false, message: `Errore sconosciuto: ${response.status}` };
    }

    // Converte la risposta in JSON
    const data = await response.json();

    // Ritorna i dati di successo
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
    return { success: false, message: "Errore di rete o server non raggiungibile." };
  }
};

async function getDocumentPosition(document_id) {
  const response = await fetch(`${SERVER_URL}/api/document/${document_id}/geo`, {
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
  else {
    return { error: "Server error" };
  }
};

const addArea = async (body) => {
  try {
    const res = await fetch(SERVER_URL + "/api/geo/area", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return { success: true, status: res.status, message: "Area added successfully." };
    }

    const errorData = await res.json(); // Estrarre il messaggio di errore dal server
    switch (res.status) {
      case 403:
        return { success: false, status: 403, error: "Area name already exists." };
      case 422:
        return { success: false, status: 422, error: "Missing or invalid latitude/longitude or area name." };
      case 500:
        return { success: false, status: 500, error: errorData.message || "Server error." };
      default:
        return { success: false, status: res.status, error: "Unexpected error." };
    }
  } catch (error) {
    return { success: false, status: 500, error: "Failed to connect to the server." };
  }
};


const addNewStakeholder = async (body) => {

  const res = await fetch(SERVER_URL + "/api/stakeholder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stakeholder_name: body }),
  });

  if (res.ok) {
    return res.status;
  } else if (res.status === 403) {
    return { error: "Stakeholder already exists." };
  }
  else {
    return { error: "Server error" };
  }
};

//Supabase

const uploadFileToSupabase = async (file, documentId) => {
  const fileName = `uploads/resources/${documentId}/${file.name}`; 
  const { data, error } = await supabase.storage
    .from('resources') 
    .upload(fileName, file, {
      contentType: file.type, 
    });

  if (error) {
    throw new Error(error.message);
  }

  const fileUrl = `${supabaseUrl}/storage/v1/object/public/resources/${fileName}`;
  return fileUrl; 
};

const downloadFileFromSupabase = async (documentId, fileName) => {
  const fileUrl = `${supabaseUrl}/storage/v1/object/public/resources/uploads/resources/${documentId}/${fileName}`;
  return fileUrl; 
};

const deleteFileFromSupabase = async (documentId, fileName) => {
  const filePath = `uploads/resources/${documentId}/${fileName}`;

  try {
    const { error } = await supabase.storage
      .from('resources')
      .remove([filePath]); 
    if (error) {
      throw new Error(error.message);
    }

    console.log(`File "${fileName}" successfully deleted from Supabase storage.`);
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
};

const listFilesInSupabase = async (documentId) => {
  const { data, error } = await supabase.storage
    .from('resources') 
    .list(`uploads/resources/${documentId}`); 

  if (error) {
    throw new Error(error.message);
  }
  return data; 
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

async function addDocumentType(typeName) {
  const response = await fetch(`${SERVER_URL}/api/types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type_name: typeName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API addDocumentType");
  }

  return response.json(); // Restituisce il nuovo tipo di documento creato
}

 const getDocumentTypes =  async () => {
  const response = await fetch(`${SERVER_URL}/api/types`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore API getDocumentTypes");
  }

  return response.json();
}
// Funzione per ottenere i dettagli di un documento tramite il suo ID (passato nel body)
async function getDocumentById(document_title) {
  try {
    // Effettua la chiamata API al server
    const response = await fetch(`${SERVER_URL}/api/document/${document_title}`, {
      method: "GET", // Usa POST per inviare il body
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Gestisce gli errori HTTP
    if (!response.ok) {
      const responseClone = response.clone(); // Clona la risposta per il logging
      console.error("Errore nella risposta:", responseClone);

      if (response.status === 404) {
        return { success: false, message: "Documento non trovato." };
      } else if (response.status === 500) {
        return { success: false, message: "Errore interno del server." };
      }

      return { success: false, message: `Errore sconosciuto: ${response.status}` };
    }

    // Converte la risposta in JSON
    const data = await response.json();

    // Ritorna i dati del documento
    return { success: true, data };
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
    return { success: false, message: "Errore di rete o server non raggiungibile." };
  }

  
}
// Funzione per eliminare un link tramite i dettagli forniti
async function deleteLink(parentId, childId, connectionType) {
  try {
    // Effettua la chiamata API al server
    const response = await fetch(`${SERVER_URL}/api/links`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parentId,
        childId,
        connectionType,
      }),
    });

    // Gestisce gli errori HTTP
    if (!response.ok) {
      const responseClone = response.clone(); // Clona la risposta per il logging
      console.error("Errore nella risposta:", responseClone);
console.log( parentId,
  childId,
  connectionType,)
      if (response.status === 404) {
        return { success: false, message: "Link non trovato." };
      } else if (response.status === 500) {
        return { success: false, message: "Errore interno del server." };
      }

      return { success: false, message: `Errore sconosciuto: ${response.status}` };
    }

    // Converte la risposta in JSON
    const data = await response.json();

    // Ritorna i dati della risposta
    return { success: true, data };
  } catch (error) {
    console.error("Errore durante la chiamata API:", error);
    return { success: false, message: "Errore di rete o server non raggiungibile." };
  }
}

const updateDocument = async (body) => {
  console.log("body", body);
  const res = await fetch(SERVER_URL + "/api/edit-document", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    return res.status;
  } else if (res.status === 400) {
    return { error: "A document with the same title already exists." };
  } else if (res.status === 500) {
    const errorData = await res.json();
    return { error: errorData.error || "An error occurred while updating the document." };
  } else {
    return { error: "Server error" };
  }
};


const updateArea = async (body) => {
  console.log("Request body:", body);

  try {
    const res = await fetch(SERVER_URL + "/api/edit-area", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return res.status; // Return status if the update is successful
    } else if (res.status === 404) {
      return { error: "Area not found. Please check the provided ID." }; // Handle area not found
    } else if (res.status === 400) {
      return { error: "Invalid input. Both area ID and name are required." }; // Handle missing input
    } else if (res.status === 409) {
      return { error: "The area name is already in use. Please choose a different name." }; // Handle duplicate name conflict
    } else if (res.status === 500) {
      return { error: "An internal server error occurred. Please try again later." }; // Handle server errors
    } else {
      return { error: "Unexpected error occurred. Please contact support." }; // Catch-all for unexpected statuses
    }
  } catch (err) {
    console.error("Error during API call:", err);
    return { error: "Unable to connect to the server. Please check your internet connection." }; // Handle network errors
  }
};




async function getAreaNameByDocumentId(document_id) {
  try {
    const response = await fetch(`${SERVER_URL}/api/get-area-name?document_id=${document_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: "Area name not found for the provided document_id." };
      } else if (response.status === 500) {
        return { success: false, message: "Internal server error." };
      }
      return { success: false, message: `Unknown error: ${response.status}` };
    }
    const data = await response.json();
    return { success: true, area_name: data.area_name };
  } catch (error) {
    return { success: false, message: "Network error or server unreachable." };
  }
}







const API = {
  logIn,
  logOut,
  addArea,
  getUserInfo,
  getDocuments,
  getDocumentsGeo,
  getGeoArea,
  getDocumentPosition,
  getAreaCoordinates,
  getStakeholders,
  updateDocumentCoordinates,
  updateDocumentArea,
  getAreaByDocumentTitle,
  deleteArea,
  addDocumentDescription,
  addNewStakeholder,
  linkDocuments,
  getConnectionsByDocumentTitle,
  deleteConnection,
  getDocumentTypes,
  addDocumentType,
  //STORAGE
  uploadFileToSupabase,
  downloadFileFromSupabase,
  deleteFileFromSupabase,
  listFilesInSupabase,
  deleteDocument,
  getDocumentById,
  deleteLink,
  updateDocument,
  updateArea,
  getAreaNameByDocumentId
};

export default API;
