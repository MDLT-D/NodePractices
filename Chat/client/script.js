import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const socket = io();
const modalName = document.getElementById("nameModal");
const messageForm = document.getElementById("formChat");
const messageInput = document.getElementById("messageInput");
const messagesSpace = document.getElementById("messagesSpace");
const nameForm = document.getElementById("nameForm");
const inputNameForm = document.getElementById("nameInput");
const usernameLabel = document.getElementById("username");
const activeUsersList = document.getElementById("activeUsersList");
const chatTitle = document.getElementById("chatTitle");
let username;

let baseChat = "general";
let privateChats = {};
let generalChat = [];

//manage the msgs into the chatspace
function addMessage(username, text, fromMe = false) {
  const li = document.createElement("li");
  li.classList.add(fromMe ? "message-me" : "message-other");

  if (fromMe) {
    const spanText = document.createElement("span");
    spanText.textContent = text;
    li.appendChild(spanText);
  } else {
    const spanUser = document.createElement("span");
    spanUser.className = "msgUsername";
    spanUser.textContent = username + ": ";

    const spanText = document.createElement("span");
    spanText.textContent = text;

    li.appendChild(spanUser);
    li.appendChild(spanText);
  }

  messagesSpace.appendChild(li);
  messagesSpace.scrollTop = messagesSpace.scrollHeight;
}
//Send a new msg
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();

  if (text !== "" && username) {
    //if is the general chat
    if (baseChat === "general") {
      socket.emit("chat message", { text, username });
    } else {
      // if is a private chat use the ids
      // baseChat = `${socket.id}-${receptorId}`
      const [id1, id2] = baseChat.split("-");
      const receptor = id1 === socket.id ? id2 : id1;

      socket.emit("private message", {
        receptor,
        message: text,
      });

      //save history of private chats
      const chatHistory = privateChats[baseChat] || [];
      chatHistory.push({ from: socket.id, sender: username, message: text });
      //update
      privateChats[baseChat] = chatHistory;
      addMessage(username, text, true); // show msg
    }
    messageInput.value = "";
  }
});

//when is a new msg validates if is mine or another user
socket.on("chat message", (info) => {
  const fromMe = info.username === username;

  // save the general chat history
  generalChat.push({
    from: info.username,
    message: info.text,
    fromMe,
  });

  // only show messages if the general chat is active
  if (baseChat === "general") {
    addMessage(info.username, info.text, fromMe);
  } else {
    // show a notification if you're in a private chat
    showNotification(`New general message from ${info.username}`, 3000);
    const chatLi = document.getElementById("general");
    chatLi.classList.add("liMsg");
  }
});

//save the username
nameForm.onsubmit = (e) => {
  e.preventDefault();
  const inputName = inputNameForm.value.trim().toUpperCase();

  if (!inputName) {
    showNotification("Please enter a username", 4000);
    return;
  }
  if (inputName.length < 4) {
    showNotification("The username need at least 4 characters", 4000);
    return;
  }
  if (inputName.split(" ").length > 1) {
    showNotification("Usernames cannot contain spaces", 4000);
    return;
  }
  //validation of the name
  socket.emit("set username", inputName, (response) => {
    if (response.ok) {
      //save the name
      username = inputName;
      socket.username = username; //save socket username
      modalName.classList.add("hiddenModal");
      inputNameForm.value = "";
      usernameLabel.textContent = username;
    } else {
      showNotification(
        "Username is already in use. Please enter a different name.",
        4000
      );
    }
  });
};

//manage a user connected
socket.on("connected", (data) => {
  showNotification(`${data.username} connected!`, 2000);

  // validation
  socket.username = socket.username || data.username;

  // update list with all the active user but no the logged user
  const filteredUsers = {};
  for (const [id, name] of Object.entries(data.users)) {
    if (name !== socket.username) {
      filteredUsers[id] = name;
    }
  }
  updateUsers(filteredUsers);
});
//manage disconections
socket.on("disconnected", (data) => {
  if (data && data.username) {
    showNotification(`${data.username} disconnected!`, 2000);
    //update list
    const filteredUsers = {};
    for (const [id, name] of Object.entries(data.users)) {
      if (name !== socket.username) {
        filteredUsers[id] = name;
      }
    }

    updateUsers(filteredUsers);

    if (baseChat !== "general" && baseChat.includes(data.socketId)) {
      console.log("tiene que volver al genral");
      baseChat = "general";
      startChat("general", "General Chat");
    }
  } else {
    showNotification("A user disconnected!", 2000);
  }
});
//manage a private message
socket.on("private message", ({ from, message, sender }) => {
  // create a chat id to the chat
  const chatId = [socket.id, from].sort().join("-");

  // save the history
  if (!privateChats[chatId]) privateChats[chatId] = [];
  privateChats[chatId].push({ from, sender, message });

  // update msgs
  if (baseChat === chatId) {
    const fromMe = from === socket.id;
    addMessage(sender, message, fromMe);
  } else {
    // show a notification if you're not in this private chat
    showNotification(`New message from ${sender}`, 3000);

    // apply class to the li of that user
    const chatLi = document.getElementById(`user-${from}`);
    if (chatLi) chatLi.classList.add("liMsg");
  }
});

//notifications
const notifications = document.getElementById("notifications");

function showNotification(message, duration) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.textContent = message;

  notifications.appendChild(notif);

  requestAnimationFrame(() => {
    notif.classList.add("show");
  });
  setTimeout(() => {
    notif.classList.remove("show");

    notif.addEventListener("transitionend", () => notif.remove());
  }, duration);
}
function updateUsers(usersObj) {
  activeUsersList.innerHTML = "";

  // element for general chat
  const generalChat = document.createElement("li");
  generalChat.classList.add("liNewUser");
  generalChat.id = "general";
  const svgNS = "http://www.w3.org/2000/svg";
  const iconUser = document.createElementNS(svgNS, "svg");
  iconUser.setAttribute("viewBox", "0 0 24 24");
  iconUser.setAttribute("width", "20");
  iconUser.setAttribute("height", "20");
  iconUser.classList.add("userIcon");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute(
    "d",
    "M12 2C6.579 2 2 6.579 2 12s4.579 10 10 10 10-4.579 10-10S17.421 2 12 2zm0 5c1.727 0 3 1.272 3 3s-1.273 3-3 3c-1.726 0-3-1.272-3-3s1.274-3 3-3zm-5.106 9.772c.897-1.32 2.393-2.2 4.106-2.2h2c1.714 0 3.209.88 4.106 2.2C15.828 18.14 14.015 19 12 19s-3.828-.86-5.106-2.228z"
  );

  iconUser.appendChild(path);

  const userName = document.createElement("span");
  userName.textContent = "General Chat";

  generalChat.appendChild(iconUser);
  generalChat.appendChild(userName);

  activeUsersList.appendChild(generalChat);

  //activate the general chat
  generalChat.onclick = () => {
    if (generalChat.classList.contains("liMsg")) {
      generalChat.classList.remove("liMsg");
    }
    startChat("general", "General Chat");
  };

  // active users
  Object.entries(usersObj).forEach(([socketId, username]) => {
    const newUser = document.createElement("li");
    newUser.classList.add("liNewUser");

    newUser.id = `user-${socketId}`;
    newUser.dataset.socketid = socketId;

    const iconUserClone = iconUser.cloneNode(true);

    const userNameSpan = document.createElement("span");
    userNameSpan.textContent = username;

    newUser.appendChild(iconUserClone);
    newUser.appendChild(userNameSpan);

    activeUsersList.appendChild(newUser);

    newUser.onclick = () => {
      if (newUser.classList.contains("liMsg")) {
        newUser.classList.remove("liMsg");
      }
      startChat(socketId, username);
    };
  });
}

function startChat(personSocketId, personUserName) {
  // if is the general chat
  if (personSocketId === "general") {
    baseChat = "general";
    chatTitle.textContent = "General Chat";

    //clear space
    messagesSpace.innerHTML = "";

    //load the history
    generalChat.forEach(({ from, message, fromMe }) => {
      addMessage(from, message, fromMe);
    });

    return;
  }

  // if is a private chat
  const chatId = [socket.id, personSocketId].sort().join("-");
  baseChat = chatId;
  chatTitle.textContent = "Chat with " + personUserName;

  // clear space
  messagesSpace.innerHTML = "";

  //load history
  const history = privateChats[chatId] || [];
  history.forEach(({ from, sender, message }) => {
    const fromMe = from === socket.id;
    addMessage(sender, message, fromMe);
  });
}
