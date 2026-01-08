const express = require('express');
const app = express();

// --- CONFIGURAÇÃO ---
const SENHA_MESTRA = "MUDE_ISSO_PARA_SUA_SENHA"; 
const PORTA_WEB = 8080; // Porta padrão que a Koyeb prefere

// Servidor Web para manter a Koyeb feliz
app.get('/', (req, res) => res.send('Servidor Online na Koyeb!'));

// Console para o seu site no Neocities
app.get('/console', (req, res) => {
    const { password, cmd } = req.query;
    if (password !== SENHA_MESTRA) return res.status(403).send("Acesso Negado");
    console.log(`[ADMIN] Comando: ${cmd}`);
    res.send(`Comando "${cmd}" recebido.`);
});

app.listen(PORTA_WEB, '0.0.0.0', () => {
    console.log(`[WEB] Painel rodando na porta ${PORTA_WEB}`);
    iniciarMC();
});

// --- LÓGICA DO MINECRAFT ---
function iniciarMC() {
    const bedrock = require('bedrock-protocol');
    const ChunkColumn = require('prismarine-chunk')('bedrock_1.0');
    const Vec3 = require('vec3');

    // Gera um chão de grama simples
    const chunk = new ChunkColumn();
    for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
            chunk.setBlockCode(new Vec3(x, 0, z), 7); // Bedrock
            chunk.setBlockCode(new Vec3(x, 1, z), 3); // Terra
            chunk.setBlockCode(new Vec3(x, 2, z), 2); // Grama
        }
    }

    try {
        const server = bedrock.createServer({
            host: '0.0.0.0',
            port: 19132,
            version: '1.1.5',
            offline: true
        });

        server.on('connect', client => {
            client.on('join', () => {
                console.log(`${client.getUserData().displayName} entrou!`);
                client.queue('start_game', {
                    entity_id: 1, runtime_entity_id: 1, player_gamemode: 0,
                    player_position: { x: 8, y: 5, z: 8 }, seed: 123, dimension: 0,
                    generator: 1, world_gamemode: 0, difficulty: 1,
                    spawn_position: { x: 8, y: 5, z: 8 }, level_id: 'world', world_name: 'Survival'
                });
                client.queue('full_chunk_data', { chunk_x: 0, chunk_z: 0, data: chunk.dump() });
            });
        });
        console.log('[MC] Servidor pronto na porta 19132');
    } catch (e) { console.error('[ERRO MC]', e); }
      }
