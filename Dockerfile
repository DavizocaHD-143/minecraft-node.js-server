FROM node:18-slim

# 1. Instala ferramentas de sistema e compiladores C++ necessários para o raknet-native
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 2. Instala o Playit Agent
RUN curl -Lo /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64 && \
    chmod +x /usr/local/bin/playit

WORKDIR /app

# 3. Copia apenas o package.json primeiro
COPY package.json .

# 4. Instala as dependências (agora com g++ disponível para compilar o raknet)
RUN npm install --no-audit --no-fund

# 5. Copia o resto dos arquivos
COPY . .

# Expõe as portas
EXPOSE 8080
EXPOSE 19132

# Inicia o servidor e o túnel
CMD ["sh", "-c", "node index.js & playit run"]
