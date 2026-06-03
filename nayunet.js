(function(Scratch) {
'use strict';

class NayuNet {
    constructor() {
        this.ws = null;
        this.connectedState = false;

        this.myId = "";
        this.players = {};

        // NEW
        this.prevPlayers = {};
        this.joinQueue = [];
        this._lastJoin = "";
    }

   getInfo() {
    return {
        id: "nayunet",
        name: "NayuNet",

       color1: "#222222",
color2: "#111111",
color3: "#000000",

        menuIconURI: "https://icons.iconarchive.com/icons/raindropmemory/laboratory/72/Girl-in-a-Box-icon.png",
        blockIconURI: "https://icons.iconarchive.com/icons/raindropmemory/laboratory/72/Girl-in-a-Box-icon.png",

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
                },

                // NEW HAT BLOCK
            {
    opcode: "playerJoin",
    blockType: Scratch.BlockType.HAT,
    text: "when player joins",
    isEdgeActivated: true
},

                // NEW REPORTER
                {
                    opcode: "lastJoinedId",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "last joined player id"
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
                const newPlayers = data.players;

                // detect joins
                for (const id in newPlayers) {
                    if (!this.players[id]) {
                        this.joinQueue.push(id);
                        this._lastJoin = id;
                    }
                }

                this.players = newPlayers;
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

    // ===== NEW BLOCK LOGIC =====

    playerJoin() {
        if (this.joinQueue.length > 0) {
            this.joinQueue.shift();
            return true;
        }
        return false;
    }

    lastJoinedId() {
        return this._lastJoin || "";
    }
}

Scratch.extensions.register(new NayuNet());

})(Scratch);
