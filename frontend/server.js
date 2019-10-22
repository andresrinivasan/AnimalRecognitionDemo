const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const redis = require("redis");
const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPassword = process.env.REDIS_PASSWORD;
const redisClient = redis.createClient({
  port: redisPort,
  host: redisHost,
  password: redisPassword,
});
const WebSocketServer = WebSocket.Server;
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const streamName = process.env.STREAM || "camera:0:yolo";

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/image", function(req, res) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(req.body.image);
    }
  });
  res.send("OK");
});

var readStream = function() {
  redisClient.xread("Block", 10000000, "STREAMS", streamName, "$", function(
    err,
    stream,
  ) {
    readStream();
    if (err) {
      return console.error(err);
    }
    var image = stream[0][1][0][1][1];
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(image);
      }
    });
  });
};

readStream();

server.listen(port, () =>
  console.log(`Redis Labs - app listening on port ${port}!`),
);

const wss = new WebSocketServer({ server: server });

wss.on("connection", function(ws) {
  ws.on("message", function(message) {
    console.log("received: %s", message);
  });
});
