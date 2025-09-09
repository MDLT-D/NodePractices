import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
const port = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

// active usernames
const activeUsers = new Set();

//new connection and validate the users
io.on("connection", (socket) => {
//  console.log("A user connected");
  io.emit("connected");

  socket.on("set username", (username, response) => {
    username = username.trim();
    if (activeUsers.has(username)) {
     
      response({ ok: false});
    } else {
      socket.username = username;
      activeUsers.add(username);
      response({ ok: true });
    }
  });

//new msg
  socket.on("chat message", (messageInfo) => {
    io.emit("chat message", messageInfo); 
  });

  //disconnection user
  socket.on("disconnect", () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
    }
    io.emit("disconnected");
  //  console.log("A user disconnected");
  });
});

app.use(logger("dev"));
app.use(express.static("client"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});

server.listen(port, () => {
  console.log("Server running, PORT:" + port);
});
