# How to Pull and Build the Docker Image

This guide explains how to pull the Docker image from the repository and build the application.

---

## Prerequisites

1. **Docker Installed**  
   Ensure that Docker is installed on your machine. If not, download and install it from [Docker's official website](https://www.docker.com/).

2. **Use the following command to pull the image:**  
   >docker pull shhtefano/kirunaexplorer-team16:client-latest

   >docker pull shhtefano/kirunaexplorer-team16:server-latest

3. **Verify that the image is successfully pulled by listing all images:**  
   >docker images
4. **Run the images:**  
   >docker run -d --name kirunaexplorer-client -p 5173:5173 shhtefano/kirunaexplorer-team16:client-latest

   >docker run -d --name kirunaexplorer-server -p 3001:3001 shhtefano/kirunaexplorer-team16:server-latest



