FROM node:18-slim

# Instala ferramentas básicas
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Instala o Playit Agent
RUN curl -Lo /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64 && \
    chmod +x /usr/local/bin/playit

WORKDIR /app

# Instala dependências antes de copiar o código (gera cache e fica mais rápido)
COPY package.json .
RUN npm install --no-audit --no-fund

# Copia o código e define as permissões
COPY . .

# Expõe a porta Web (Koyeb) e a porta do Minecraft
EXPOSE 8080
EXPOSE 19132

# Inicia o servidor e o túnel
CMD ["sh", "-c", "node index.js & playit run"]
