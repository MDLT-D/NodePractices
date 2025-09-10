import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";


const socket = io();
const modalName = document.getElementById("nameModal");
const messageForm = document.getElementById("formChat");
const messageInput = document.getElementById("messageInput");
const messagesSpace = document.getElementById("messagesSpace");
const nameForm = document.getElementById("nameForm");
const inputNameForm = document.getElementById("nameInput");
const usernameLabel = document.getElementById("username");
const activeUsersList= document.getElementById('activeUsersList')
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
      modalName.classList.add("hiddenModal");
      inputNameForm.value = "";
      usernameLabel.textContent = username;
    } else {
      //ask for another name
      showNotification(
        "Username is already in use. Please enter a different name.",
        4000
      );
    }
  });
};

//handle connections
socket.on("connected", (data) => {
  showNotification(`${data.username} connected!`, 2000);
  updateUsers(data.activeUsers); 
});


socket.on("disconnected", () => {
  showNotification("A user disconnected!", 2000);
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

function updateUsers(listUsers){
  activeUsersList.innerHTML = ''; 
  listUsers.forEach(user => {
    const newUser = document.createElement('li');
    newUser.classList.add('liNewUser');

    
    const svgNS = "http://www.w3.org/2000/svg";
    const iconUser = document.createElementNS(svgNS, "svg");
    iconUser.setAttribute("viewBox", "0 0 24 24");
    iconUser.setAttribute("width", "20");
    iconUser.setAttribute("height", "20");
    iconUser.classList.add("userIcon");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M12 2C6.579 2 2 6.579 2 12s4.579 10 10 10 10-4.579 10-10S17.421 2 12 2zm0 5c1.727 0 3 1.272 3 3s-1.273 3-3 3c-1.726 0-3-1.272-3-3s1.274-3 3-3zm-5.106 9.772c.897-1.32 2.393-2.2 4.106-2.2h2c1.714 0 3.209.88 4.106 2.2C15.828 18.14 14.015 19 12 19s-3.828-.86-5.106-2.228z");

    iconUser.appendChild(path);


    const userName = document.createElement('span');
    userName.textContent = user;


    newUser.appendChild(iconUser);
    newUser.appendChild(userName);

    activeUsersList.appendChild(newUser);
  });
}


//<img src="/user.svg">