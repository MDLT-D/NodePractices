import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

// active usernames
let activeUsers = {};
//provates chats for user, relation with socket id
let privateChats = {};

//new connection and validate the users
io.on("connection", (socket) => {
  //  console.log("A user connected");
  //manage a username
  socket.on("set username", (username, response) => {
    //Validate the username
    if (Object.values(activeUsers).includes(username)) {
      response({ ok: false });
    } else {
      //save id and username in the active users
      activeUsers[socket.id] = username;
      socket.username = username;
      //console.log("Connected users:", Object.values(activeUsers));
      response({ ok: true });
      //send the list of the users active updated
      io.emit("connected", {
        username,
        users: activeUsers,
      });
    }
  });
  //manage  the disconection
  socket.on("disconnect", () => {
    if (activeUsers[socket.id]) {
      const disconnectedUser = activeUsers[socket.id];
      delete activeUsers[socket.id];

      io.emit("disconnected", {
        username: disconnectedUser,
        users: activeUsers,
      });

      //  console.log(`${disconnectedUser} disconnected`);
      //console.log("Connected users:", Object.values(activeUsers));
    }
  });

  //new msg for the general chat
  socket.on("chat message", (messageInfo) => {
    io.emit("chat message", messageInfo);
  });
//manage a private message
  socket.on("private message", ({ receptor, message }) => {
    const from = socket.id;
    const sender = socket.username;

    if (!activeUsers[receptor]) return;

    // id for chat sender-receptor
    const chatId = [from, receptor].sort().join("-");

    // History of chat for a new chat if not exists
    if (!privateChats[chatId]) privateChats[chatId] = [];

    // Save msg in the history
    privateChats[chatId].push({
      from,
      sender,
      message,
      timestamp: Date.now(),
    });

    // send message only to receptor(id)
    io.to(receptor).emit("private message", {
      from,
      sender,
      message,
    });

    //save to the sender to keep history
    socket.emit("private sent", {
      to: receptor,
      sender,
      message,
    });
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
