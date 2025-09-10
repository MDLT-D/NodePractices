import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

// active usernames
let activeUsers = [];

//new connection and validate the users
io.on("connection", (socket) => {
//  console.log("A user connected");

socket.on("set username", (username, response) => {
  username = username.trim();

  if (activeUsers.includes(username)) {
    response({ ok: false });
  } else {
    socket.username = username;
    activeUsers.push(username);

    console.log("Connected users:", activeUsers);

    response({ ok: true });

    // manda la lista actualizada a todos
    io.emit("connected", {
      username,
      activeUsers
    });
  }
});


//new msg
  socket.on("chat message", (messageInfo) => {
    io.emit("chat message", messageInfo); 
  });

socket.on("disconnect", () => {
  console.log(activeUsers);
    if (socket.username) {
      activeUsers = activeUsers.filter((u) => u !== socket.username);

      io.emit("disconnected");
      console.log(activeUsers);
    }
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
