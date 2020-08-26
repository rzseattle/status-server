import WebSocket from "ws";
import { messageProcessor } from "../message-processor/MessageProcessor";
import { structure } from "../jobs-structure/Structure";
import { nanoid } from "nanoid";
import { listeners } from "../listeners/Listeners";

class MyWebsockets {
    private monitorListener!: WebSocket.Server;
    private listenersListener!: WebSocket.Server;

    constructor() {
        this.initMonitorListener();
        this.initListenersListener();
    }

    private initMonitorListener = () => {
        console.log("Init monitors listener on 3011");
        this.monitorListener = new WebSocket.Server({ port: 3011 });
        this.monitorListener.on("connection", (ws) => {
            ws.on("message", (message) => {
                try {
                    // console.log("message 12 1");
                    // console.log(message);
                    // console.log("-----------------");
                    messageProcessor.process(JSON.parse(message.toString()), ws);
                } catch (e) {
                    console.log("Error while processing message");
                }
            });
        });
    };

    private initListenersListener = () => {
        console.log("Init listeners listener on 3012");
        this.listenersListener = new WebSocket.Server({ port: 3012 });

        this.listenersListener.on("connection", (ws) => {
            console.log("got new connection");

            ws.send(JSON.stringify(structure.getAll()));
            // @ts-ignore
            ws.id = nanoid();

            ws.on("message", (message) => {
                const parsed: any = JSON.parse(message.toString());
                listeners.set(ws, parsed);
                console.log(listeners);
            });

            ws.on("close", () => {
                // @ts-ignore
                console.log("closing " + ws.id);
                listeners.delete(ws);
            });
            ws.on("error", () => {
                console.log("error in listener");
                listeners.delete(ws);
            });
        });
    };

    public informClients = (data: any) => {
        console.clear();
        this.listenersListener.clients.forEach((ws) => {
            ws.send(JSON.stringify(data));
        });
    };
}

export const websockets = new MyWebsockets();
