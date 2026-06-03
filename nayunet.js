class NayuNet {
    constructor() {
        this.ws = null;
        this.connectedState = false;

        this.myId = "";
        this.players = {};

        this.clones = {}; // id -> clone
        this.targetSprite = null;
    }

    getInfo() {
        return {
            id: "nayunet",
            name: "NayuNet",

            blocks: [
                { opcode: "connect", blockType: Scratch.BlockType.COMMAND, text: "connect" },

                {
                    opcode: "attachSprite",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "use sprite as player"
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

                { opcode: "connected", blockType: Scratch.BlockType.BOOLEAN, text: "connected?" },
                { opcode: "myid", blockType: Scratch.BlockType.REPORTER, text: "my id" }
            ]
        };
    }

    /* ================= CONNECT ================= */

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
                this.updateClones();
            }
        };
    }

    /* ================= SPRITE LINK ================= */

    attachSprite() {
        this.targetSprite = Scratch.vm.runtime.getSpriteTarget();
    }

    /* ================= CLONE SYSTEM ================= */

    updateClones() {
        if (!this.targetSprite) return;

        const runtime = Scratch.vm.runtime;
        const me = this.myId;

        const currentIds = Object.keys(this.players);

        // REMOVE OLD CLONES
        for (let id in this.clones) {
            if (!this.players[id] || id === me) {
                this.clones[id]?.kill?.();
                delete this.clones[id];
            }
        }

        // CREATE / UPDATE
        for (let id of currentIds) {
            if (id === me) continue;

            let p = this.players[id];

            // create clone if missing
            if (!this.clones[id]) {
                const clone = runtime._addClone(this.targetSprite);

                clone.nayunet_id = id;

                this.clones[id] = clone;
            }

            // update clone position
            const clone = this.clones[id];
            clone.setXY(p.x, p.y);
        }
    }

    /* ================= MOVEMENT ================= */

    sendPosition(args) {
        if (!this.connectedState) return;

        this.ws.send(JSON.stringify({
            type: "move",
            x: Number(args.X),
            y: Number(args.Y)
        }));
    }

    /* ================= BASIC INFO ================= */

    connected() {
        return this.connectedState;
    }

    myid() {
        return this.myId;
    }
}

Scratch.extensions.register(new NayuNet());
