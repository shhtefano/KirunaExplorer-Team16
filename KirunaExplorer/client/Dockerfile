# Dockerfile (Client)
FROM node:20-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dell'applicazione
COPY . .

# Costruisci l'applicazione
RUN npm run build

# Usa un server statico per servire il frontend
RUN npm install -g serve

# Esponi la porta 5173 (Vite) o quella configurata per il frontend
EXPOSE 5173

# Comando di avvio
CMD ["serve", "-s", "dist"]
