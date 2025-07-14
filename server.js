"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
class Protocol {
    constructor(ws) {
        this.sequence = [
            { text: 'hello', timeout: 2000 },
            { text: 'still there?', timeout: 3000 },
            { text: 'you can leave now', timeout: 3500 },
            { text: 'you can leave now', timeout: 3500 },
            { text: 'you can leave now', timeout: 3500 },
            { text: 'you can leave now', timeout: 3500 },
        ];
        this.ws = ws;
    }
    send(message, interval) {
        return new Promise(resolve => {
            setTimeout(async () => {
                console.info('Sending', message);
                this.ws.send(message);
                resolve();
            }, interval);
        });
    }
    async start() {
        for (const message of this.sequence) {
            const { text, timeout } = message;
            await this.send(text, timeout);
        }
    }
}
const port = 8080;
const ws = new ws_1.WebSocketServer({ port });
ws.on('listening', () => {
    console.info('Listening on port', port);
});
ws.on('error', console.error);
ws.on('connection', (ws) => {
    new Protocol(ws).start().then(() => {
        console.info('Protocol completed');
    });
});
