function formatTime(date: Date) {
    const timeString = date.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${timeString}.${milliseconds}`;
}

interface ReceivedMessage {
    createdAt: Date;
    message: string;
}

interface Message {
    text: string,
    timeout: number,
}

class Protocol {

    protected ws: WebSocket;

    protected threshold = 300;
    protected startedAt = Date.now();

    protected sequence: Message[] = [
        { text: 'hello', timeout: 2000 },
        { text: 'still there?', timeout: 3000 },
        { text: 'you can leave now', timeout: 3500 },
        { text: 'you can leave now', timeout: 3500 },
        { text: 'you can leave now', timeout: 3500 },
        { text: 'you can leave now', timeout: 3500 },
    ];

    protected messages: ReceivedMessage[] = [];

    protected isOk = true;
    protected offset = 0;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    messageHandler(event: MessageEvent) {
        try {
            const data = event.data;

            this.messages.push({
                message: data,
                createdAt: new Date()
            });
            // console.info('Received', data, formatTime(new Date()));
        }
        catch (e) {
            if (e instanceof Error) {
                this.error(e.message);
            }
            else {
                console.error('Something went wrong', e);
            }
        }
    }

    checkReceived(message: string, interval: number) {
        const offset = this.offset;

        setTimeout(() => {
            if (!this.isOk) {
                return;
            }

            const from = this.startedAt + offset + interval - this.threshold;
            const till = this.startedAt + offset + interval + this.threshold;

            // console.info(`Check ${message} offset`, offset);

            const found = this.messages.find(m => m.message === message && m.createdAt.getTime() >= from && m.createdAt.getTime() <= till);
            if (!found) {
                this.error(`expected "${message}" between ${formatTime(new Date(from))} and ${formatTime(new Date(till))}`);
                console.info('M', this.messages.map(i => ({...i, createdAt: formatTime(i.createdAt)})));
            }
            else {
                console.info(`Protocol OK: ${message} received at ${formatTime(found.createdAt)}`);
            }
        }, offset + interval + this.threshold);

        this.offset += interval;
    }

    async wait() {
        this.ws.addEventListener('message', this.messageHandler.bind(this));

        for (const message of this.sequence) {
            const { text, timeout } = message;
            this.checkReceived(text, timeout);
        }

        // Final check
        setTimeout(() => {
            if (this.isOk) {
                console.info('Protocol sequence OK');
            }
        }, this.offset + this.threshold);
    }

    error(error: string) {
        this.isOk = false;
        console.info(`Protocol ERR: ${error}`);
        this.ws.close();
        throw new Error(error);
    }
}

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
    new Protocol(ws).wait();
});
