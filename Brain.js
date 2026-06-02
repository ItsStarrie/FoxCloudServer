const WebSocket = require("ws");

const server = new WebSocket.Server({ port: process.env.PORT || 10000 });

const players = {};

server.on("connection", (ws) => {
    const id = Math.random().toString(36).slice(2);

    players[id] = { x: 0, y: 0 };

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "move") {
                players[id] = {
                    x: data.x,
                    y: data.y
                };
            }
        } catch {}
    });

    ws.on("close", () => {
        delete players[id];
    });

    const interval = setInterval(() => {
        ws.send(JSON.stringify({
            type: "players",
            players
        }));
    }, 50);

    ws.on("close", () => clearInterval(interval));
});
