import WebSocket, { WebSocketServer } from 'ws';

interface Message {
    text: string,
    timeout: number,
}

class Protocol {

    sequence: Message[] = [
        { text: 'hello', timeout: 2000 },
        { text: 'still there?', timeout: 3000 },
        { text: 'you can leave now', timeout: 3500 },
        { text: 'you can leave now', timeout: 3500 },
        { text: 'you can leave now', timeout: 3500 },
        { text: 'you can leave now', timeout: 3500 },
    ];

    protected ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    send(message: string, interval: number) {
        return new Promise<void>(resolve => {
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
const ws = new WebSocketServer({ port });

ws.on('listening', () => {
    console.info('Listening on port', port);
})

ws.on('error', console.error);

ws.on('connection', (ws)=> {
    new Protocol(ws).start().then(() => {
        console.info('Protocol completed');
    });
})
