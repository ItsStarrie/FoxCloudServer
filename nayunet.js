class NayuNet {
    constructor() {
        this.ws = null;
        this.players = {};
    }

    getInfo() {
        return {
            id: 'nayunet',
            name: 'NayuNet',
            blocks: [
                {
                    opcode: 'connect',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'connect'
                },
                {
                    opcode: 'sendPosition',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'send position x [X] y [Y]',
                    arguments: {
                        X: { type: Scratch.ArgumentType.NUMBER },
                        Y: { type: Scratch.ArgumentType.NUMBER }
                    }
                },
                {
                    opcode: 'getPlayerX',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'player x of [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING }
                    }
                },
                {
                    opcode: 'getPlayerY',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'player y of [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING }
                    }
                }
            ]
        };
    }

    connect() {
        this.ws = new WebSocket('wss://projectnayu.onrender.com');

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "players") {
                this.players = data.players;
            }
        };
    }

    sendPosition(args) {
        if (!this.ws) return;

        this.ws.send(JSON.stringify({
            type: "move",
            x: Number(args.X),
            y: Number(args.Y)
        }));
    }

    getPlayerX(args) {
        return this.players[args.ID]?.x || 0;
    }

    getPlayerY(args) {
        return this.players[args.ID]?.y || 0;
    }
}

Scratch.extensions.register(new NayuNet());
