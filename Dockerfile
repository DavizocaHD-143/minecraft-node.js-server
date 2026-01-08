FROM node:18-slim

# 1. Instala dependências de compilação
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    gcc \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# 2. Instala o Playit Agent (Binário oficial atualizado)
RUN curl -Lo /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64 && \
    chmod +x /usr/local/bin/playit

# 3. Define a pasta de trabalho
WORKDIR /app

# 4. Copia as configurações de dependências
COPY package.json .

# 5. Instala as bibliotecas (Compilando RakNet e pacotes nativos)
RUN npm install --no-audit --no-fund

# 6. Copia o código do servidor
COPY . .

# 7. Portas (8080 = Web/Koyeb | 19132 = Minecraft UDP)
EXPOSE 8080
EXPOSE 19132/udp

# 8. Comando de inicialização robusto
# Adicionei o 'playit run' ou 'playit' e garanti que o node rode em primeiro plano
CMD ["sh", "-c", "playit & node index.js"]
