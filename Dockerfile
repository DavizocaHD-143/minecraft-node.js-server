FROM node:18-slim

# 1. Instala TUDO que o raknet-native precisa para compilar
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    gcc \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# 2. Instala o Playit Agent
RUN curl -Lo /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64 && \
    chmod +x /usr/local/bin/playit

WORKDIR /app

# 3. Copia apenas o package.json
COPY package.json .

# 4. Instala as dependências (agora com CMake e G++)
RUN npm install --no-audit --no-fund

# 5. Copia o resto dos arquivos
COPY . .

# Portas
EXPOSE 8080
EXPOSE 19132

# Inicia o servidor e o túnel
CMD ["sh", "-c", "node index.js & playit run"]
