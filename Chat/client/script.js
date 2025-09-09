import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const socket = io();
const modalName = document.getElementById("nameModal");
const messageForm = document.getElementById("formChat");
const messageInput = document.getElementById("messageInput");
const messagesSpace = document.getElementById("messagesSpace");
const nameForm = document.getElementById("nameForm");
const inputNameForm = document.getElementById("nameInput");
let username;

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

//send a new msg
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text !== "" && username) {
    socket.emit("chat message", { text, username });
    messageInput.value = "";
  }
});

//when is a new msg validates if is mine or another user
socket.on("chat message", (info) => {
  const fromMe = info.username === username;
  addMessage(info.username, info.text, fromMe);
});

//save the username
nameForm.onsubmit = (e) => {
  e.preventDefault();
  const inputName = inputNameForm.value.trim().toUpperCase();

  if (!inputName){
    showNotification("Please enter a username",4000);
    return;
  } 

  //validation of the name
  socket.emit("set username", inputName, (response) => {
    if (response.ok) {
      //save the name
      username = inputName;
      modalName.classList.add("hiddenModal");
      inputNameForm.value = "";
    } else {
      //ask for another name
           showNotification("Username is already in use. Please enter a different name.", 4000);
   
    }
  });
};

//handle connections
socket.on("connected", () => {
  showNotification("New user connected!",2000);
});

socket.on("disconnected", () => {
  showNotification("A user disconnected!",2000);
});

//notifications
const notifications = document.getElementById("notifications");

function showNotification(message, duration ) {
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
