import net from "net";
import { WebSocket, WebSocketServer } from "ws";

interface VehicleData {
  battery_temperature: number | string;
  timestamp: number;
}

function decodeBatteryTemperature(value: number | string): number {
  if (typeof value == "number") {
    return value;
  } else {
    const buf = Buffer.from(value, "binary");
    return buf.readInt32LE(0);
  }
}

const TCP_PORT = 12000;
const WS_PORT = 8080;
const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: WS_PORT });

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  socket.on("data", (msg) => {
    const message: string = msg.toString();

    console.log(`Received: ${message}`);

    const parsed: VehicleData = JSON.parse(message);

    const decodedTemp: number = decodeBatteryTemperature(parsed.battery_temperature);

    const decodedMsg: VehicleData = {
      battery_temperature: decodedTemp,
      timestamp: parsed.timestamp
    }

    const decodedMessage: string = JSON.stringify(decodedMsg)
    // console.log(`Decoded: ${decodedMessage}`);
    
    // Send JSON over WS to frontend clients
    websocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(decodedMessage);
      }
    });
  });

  socket.on("end", () => {
    console.log("Closing connection with the TCP client");
  });

  socket.on("error", (err) => {
    console.log("TCP client error: ", err);
  });
});

websocketServer.on("listening", () =>
  console.log(`Websocket server started on port ${WS_PORT}`)
);

websocketServer.on("connection", async (ws: WebSocket) => {
  console.log("Frontend websocket client connected");
  ws.on("error", console.error);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
