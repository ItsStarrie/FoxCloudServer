class NayuNet {
    constructor() {
        this.ws = null;
        this.connectedState = false;

        this.myId = "";
        this.players = {};
    }

    getInfo() {
        return {
            id: "nayunet",
            name: "NayuNet",

            blocks: [
                { opcode: "connect", blockType: Scratch.BlockType.COMMAND, text: "connect" },

                { opcode: "connected", blockType: Scratch.BlockType.BOOLEAN, text: "connected?" },

                { opcode: "myid", blockType: Scratch.BlockType.REPORTER, text: "my id" },

                { opcode: "playerCount", blockType: Scratch.BlockType.REPORTER, text: "player count" },

                {
                    opcode: "playerId",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "player id # [N]",
                    arguments: {
                        N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                    }
                },

                {
                    opcode: "playerX",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "x of player [ID]",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING }
                    }
                },

                {
                    opcode: "playerY",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "y of player [ID]",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING }
                    }
                },

                {
                    opcode: "sendPosition",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "send x [X] y [Y]",
                    arguments: {
                        X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                        Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
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
        };

        this.ws.onclose = () => {
            this.connectedState = false;
            this.ws = null;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "welcome") {
                this.myId = data.id;
            }

            if (data.type === "players") {
                this.players = data.players;
            }
        };
    }

    connected() {
        return this.connectedState;
    }

    myid() {
        return this.myId;
    }

    playerCount() {
        return Object.keys(this.players).length;
    }

    playerId(args) {
        const ids = Object.keys(this.players);
        return ids[args.N - 1] || "";
    }

    playerX(args) {
        return this.players?.[args.ID]?.x ?? 0;
    }

    playerY(args) {
        return this.players?.[args.ID]?.y ?? 0;
    }

    sendPosition(args) {
        if (!this.connectedState) return;

        this.ws.send(JSON.stringify({
            type: "move",
            x: Number(args.X),
            y: Number(args.Y)
        }));
    }
}

Scratch.extensions.register(new NayuNet());
