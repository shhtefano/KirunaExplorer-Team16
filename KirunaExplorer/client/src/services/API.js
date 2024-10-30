const SERVER_URL = "http://localhost:3001";

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


const API = {
  fetchServices,
};
*/

export default API;