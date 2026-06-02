const WebSocket = require("ws");

const port = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port });

const players = {};

function broadcastPlayers() {
    const packet = JSON.stringify({
        type: "players",
        players
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(packet);
        }
    });
}

wss.on("connection", ws => {
    const id =
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);

    players[id] = {
        x: 0,
        y: 0
    };

    ws.playerId = id;

    ws.send(JSON.stringify({
        type: "welcome",
        id
    }));

    broadcastPlayers();

    ws.on("message", msg => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "move") {
                players[id].x = Number(data.x) || 0;
                players[id].y = Number(data.y) || 0;
            }

            if (data.type === "ping") {
    ws.send(JSON.stringify({
        type: "pong"
    }));
}
        } catch {}
    });

    ws.on("close", () => {
        delete players[id];
        broadcastPlayers();
    });
});

setInterval(broadcastPlayers, 50);

console.log("Server running");
