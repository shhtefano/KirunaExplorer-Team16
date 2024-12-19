
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kiruna-explorer-team-16_kiruna-explorer&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kiruna-explorer-team-16_kiruna-explorer)
# How to Pull and Build the Docker Image

This guide explains how to pull the Docker image from the repository and build the application.

---

## Option 1: Pulling the Docker Image

1. **Docker Installed**  
   Ensure that Docker is installed on your machine. If not, download and install it from [Docker's official website](https://www.docker.com/).

2. **Use the following command to pull the image:**  
   >docker pull shhtefano/kirunaexplorer-team16:client-latest ; docker pull shhtefano/kirunaexplorer-team16:server-latest

3. **Verify that the image is successfully pulled by listing all images:**  
   >docker images
4. **Run the images:**  
   >docker run -d --name kirunaexplorer-client -p 5173:5173 shhtefano/kirunaexplorer-team16:client-latest ; docker run -d --name kirunaexplorer-server -p 3001:3001 shhtefano/kirunaexplorer-team16:server-latest
### Note: If Docker shows an error, you may need to remove all previous containers using the command
   >docker rm $(docker ps -aq)

## Option 2: Cloning the Repository and Building with Docker Compose
   
1. **Clone the repository: First, clone the repository to your local machine by running:**  
   >git clone https://github.com/shhtefano/KirunaExplorer-Team16/
   
   >cd KirunaExplorer-Team16
   
2. **Build and start the application with Docker Compose: Once you have cloned the repository, use the following command to build and start the application with Docker Compose:**  
   >docker-compose up --build
   


