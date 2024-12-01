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


async function getAreaCoordinates(area_id){
  const response = await fetch(`${SERVER_URL}/api/geo/:${area_id}`, {
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
      console.log(response);
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

const addNewStakeholder = async (body) => {
  console.log(body);
  
  const res = await fetch(SERVER_URL + "/api/stakeholder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({stakeholder_name: body}),
  });
  console.log(res.status);
  
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

// Funzione per caricare un file su Supabase
const uploadFileToSupabase = async (file, documentId) => {
  // Create a path that includes the document ID
  const fileName = `uploads/resources/${documentId}/${file.name}`; // Path del file nel bucket

  const { data, error } = await supabase.storage
    .from('resources') // Nome del bucket
    .upload(fileName, file, {
      contentType: file.type, // Usa il MIME type del file
    });

  if (error) {
    throw new Error(error.message);
  }

  const fileUrl = `${supabaseUrl}/storage/v1/object/public/resources/${fileName}`;
  return fileUrl; // Return the file URL
};

// Function to download a file from Supabase
const downloadFileFromSupabase = async (documentId, fileName) => {
  // Construct the file URL
  const fileUrl = `${supabaseUrl}/storage/v1/object/public/resources/uploads/resources/${documentId}/${fileName}`;
  return fileUrl; // Return the file URL for downloading
};

// Function to get the list of files from Supabase
const listFilesInSupabase = async (documentId) => {
  // List files in the specific folder corresponding to the document ID
  const { data, error } = await supabase.storage
    .from('resources') // Specify the bucket name
    .list(`uploads/resources/${documentId}`); // Fetch the list of files in the document's folder

  if (error) {
    throw new Error(error.message);
  }

  return data; // Return the list of files
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
  logOut,
  getUserInfo,
  getDocuments,
  getDocumentsGeo,
  getGeoArea,
  getDocumentPosition,
  getAreaCoordinates,
  getStakeholders,
  updateDocumentCoordinates,
  updateDocumentArea,
  addDocumentDescription,
  addNewStakeholder,
  linkDocuments,
  getConnectionsByDocumentTitle,
  deleteConnection,
  //STORAGE
  uploadFileToSupabase,
  downloadFileFromSupabase,
  listFilesInSupabase
};

export default API;
