FROM node:18-slim

# 1. Instala dependências de compilação (necessárias para o Minecraft Bedrock no Node.js)
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    gcc \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# 2. Instala o Playit Agent (Túnel para liberar o IP do servidor)
RUN curl -Lo /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64 && \
    chmod +x /usr/local/bin/playit

# 3. Define a pasta de trabalho
WORKDIR /app

# 4. Copia as configurações de dependências
COPY package.json .

# 5. Instala as bibliotecas (isso vai demorar um pouco porque vai compilar o RakNet)
RUN npm install --no-audit --no-fund

# 6. Copia o código do servidor (index.js e outros)
COPY . .

# 7. Informa ao Koyeb as portas que o app utiliza
EXPOSE 8080
EXPOSE 19132

# 8. Inicia o servidor e o Playit simultaneamente
# Nota: O comando 'playit' sem o 'run' evita o erro de subcomando na versão atual
CMD ["sh", "-c", "node index.js & playit"]
