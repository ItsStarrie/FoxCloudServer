class NayuNet {
    constructor() {
        this.ws = null;
        this.connectedState = false;

        this.myId = "";
        this.players = {};

        this.ping = 0;
        this.lastPingSent = 0;
        this.pingInterval = null;
    }

    getInfo() {
        return {
            id: "nayunet",
            name: "NayuNet",

            blocks: [
                {
                    opcode: "connect",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "connect"
                },
                {
                    opcode: "disconnect",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "disconnect"
                },
                {
                    opcode: "connected",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "connected?"
                },
                {
                    opcode: "myid",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "my id"
                },
                {
                    opcode: "getPing",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "server ping"
                },
                {
                    opcode: "sendPosition",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "send my position x [X] y [Y]",
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: "playerCount",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "player count"
                },
                {
                    opcode: "playerId",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "player id # [INDEX]",
                    arguments: {
                        INDEX: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: "playerExists",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "player exists [ID]",
                    arguments: {
                        ID: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: "playerX",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "x of player [ID]",
                    arguments: {
                        ID: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: "playerY",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "y of player [ID]",
                    arguments: {
                        ID: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                }
            ]
        };
    }

    connect() {
        if (this.ws) return;

        this.ws = new WebSocket("wss://projectnayu.onrender.com");

        this.ws.onopen = () => {
            this.connectedState = true;

            this.pingInterval = setInterval(() => {
                if (!this.connectedState) return;

                this.lastPingSent = Date.now();

                this.ws.send(JSON.stringify({
                    type: "ping"
                }));
            }, 2000);
        };

        this.ws.onclose = () => {
            this.connectedState = false;

            if (this.pingInterval) {
                clearInterval(this.pingInterval);
            }

            this.ws = null;
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "welcome") {
                    this.myId = data.id;
                }

                if (data.type === "players") {
                    this.players = data.players;
                }

                if (data.type === "pong") {
                    this.ping = Date.now() - this.lastPingSent;
                }
            } catch {}
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    connected() {
        return this.connectedState;
    }

    myid() {
        return this.myId;
    }

    getPing() {
        return this.ping;
    }

    sendPosition(args) {
        if (!this.connectedState) return;

        this.ws.send(JSON.stringify({
            type: "move",
            x: Number(args.X),
            y: Number(args.Y)
        }));
    }

    playerCount() {
        return Object.keys(this.players).length;
    }

    playerId(args) {
        const ids = Object.keys(this.players);
        return ids[Number(args.INDEX) - 1] || "";
    }

    playerExists(args) {
        return Object.prototype.hasOwnProperty.call(this.players, args.ID);
    }

    playerX(args) {
        return this.players[args.ID]?.x ?? 0;
    }

    playerY(args) {
        return this.players[args.ID]?.y ?? 0;
    }
}

Scratch.extensions.register(new NayuNet());
