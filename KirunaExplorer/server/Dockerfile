# Dockerfile (Server)
FROM node:20-bullseye-slim

# Aggiorna i pacchetti di sistema e installa sqlite3
RUN apt-get update && apt-get install -y sqlite3 build-essential python3

# Imposta la directory di lavoro
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dell'applicazione
COPY . .

# Esponi la porta dell'applicazione
EXPOSE 3001

# Comando di avvio
CMD ["node", "index.mjs"]
