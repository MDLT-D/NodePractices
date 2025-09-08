import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
const socket = io();

const messageForm = document.getElementById("formChat");
const messageInput = document.getElementById("messageInput");
const messagesSpace= document.getElementById("messagesSpace");

socket.on('chat message', (msg)=>{
    const item = '<li>'+msg+'</li>';
    messagesSpace.insertAdjacentHTML('beforeend',item)
})


messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(messageInput.value.trim() !== "") {
        socket.emit('chat message', messageInput.value.trim());
        messageInput.value = "";
    }
});
