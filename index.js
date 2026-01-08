const express = require('express');
const bedrock = require('bedrock-protocol');
const ChunkColumn = require('prismarine-chunk')('bedrock_1.0');
const Vec3 = require('vec3');
const app = express();

// --- CONFIGURAÇÕES ROBUSTAS ---
const SETTINGS = {
    WEB_PORT: process.env.PORT || 8080,
    MC_PORT: 19132,
    VERSION: '1.1.5',
    MAX_PLAYERS: 20,
    WORLD_NAME: "Survival Classico 1.1.5",
    SEED: 42
};

// --- ESTRUTURA DO MUNDO ---
// Gera um chunk padrão para todos os jogadores (Survival Plano para performance)
const chunk = new ChunkColumn();
for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
        chunk.setBlockType(new Vec3(x, 0, z), 7); // Bedrock
        for (let y = 1; y < 4; y++) chunk.setBlockType(new Vec3(x, y, z), 3); // Terra
        chunk.setBlockType(new Vec3(x, 4, z), 2); // Grama
    }
}
const chunkData = chunk.dump();

// --- SERVIDOR WEB (Health Check Koyeb) ---
app.get('/', (req, res) => {
    res.status(200).send({
        status: "Online",
        players: Object.keys(server?.clients || {}).length + "/" + SETTINGS.MAX_PLAYERS,
        version: SETTINGS.VERSION
    });
});

app.listen(SETTINGS.WEB_PORT, '0.0.0.0', () => {
    console.log(`[WEB] Monitor online na porta ${SETTINGS.WEB_PORT}`);
});

// --- SERVIDOR MINECRAFT (Protocolo 1.1.5) ---
let server;
try {
    server = bedrock.createServer({
        host: '0.0.0.0',
        port: SETTINGS.MC_PORT,
        version: SETTINGS.VERSION,
        offline: true, // Permite conexões sem autenticação Xbox (Essencial para 1.1.5)
        maxPlayers: SETTINGS.MAX_PLAYERS,
        motd: {
            levelName: SETTINGS.WORLD_NAME,
            motd: "§bSurvival Node.js §f1.1.5"
        }
    });

    server.on('connect', client => {
        // Tratamento de erros por cliente para o servidor não cair
        client.on('error', (err) => console.error(`[ERRO CLIENTE]`, err));

        client.on('join', () => {
            const user = client.getUserData();
            console.log(`[LOGIN] ${user.displayName} conectou.`);

            // Pacote de início do jogo
            client.queue('start_game', {
                entity_id: 1,
                runtime_entity_id: 1,
                player_gamemode: 0, // Survival
                player_position: { x: 8, y: 6, z: 8 },
                seed: SETTINGS.SEED,
                dimension: 0,
                generator: 1,
                world_gamemode: 0,
                difficulty: 1,
                spawn_position: { x: 8, y: 6, z: 8 },
                level_id: 'world',
                world_name: SETTINGS.WORLD_NAME
            });

            // Envio do terreno
            client.queue('full_chunk_data', {
                chunk_x: 0,
                chunk_z: 0,
                data: chunkData
            });

            // Mensagem de Boas-vindas
            setTimeout(() => {
                client.queue('text', {
                    type: 'chat',
                    needs_translation: false,
                    source_name: "",
                    xuid: "",
                    platform_chat_id: "",
                    message: `§eBem-vindo ao servidor 1.1.5 robusto!\n§7Jogadores online: ${Object.keys(server.clients).length}`
                });
            }, 1000);
        });

        // Chat Global
        client.on('text', (packet) => {
            console.log(`[CHAT] ${client.getUserData().displayName}: ${packet.message}`);
            // Retransmite a mensagem para todos os outros
            for (const id in server.clients) {
                server.clients[id].queue('text', {
                    type: 'chat',
                    needs_translation: false,
                    source_name: "",
                    xuid: "",
                    platform_chat_id: "",
                    message: `§f${client.getUserData().displayName}: ${packet.message}`
                });
            }
        });
    });

    console.log(`[MC] Servidor Pocket Edition 1.1.5 rodando na porta ${SETTINGS.MC_PORT}`);

} catch (e) {
    console.error('[ERRO FATAL]', e);
}

// Anti-crash para erros não capturados
process.on('uncaughtException', (err) => {
    console.error('[FOI POR POUCO] Erro evitado:', err.message);
});
