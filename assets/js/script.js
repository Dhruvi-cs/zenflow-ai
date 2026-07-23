function sendMessage(){

    let input = document.getElementById("message");

    let text = input.value.trim();

    if(text==="") return;

    let body = document.querySelector(".chat-body");

    body.innerHTML +=
    `<div class="user-message">${text}</div>`;

    body.innerHTML +=
    `<div class="bot-message">Thank you! Our AI has received your message.</div>`;

    input.value="";

    body.scrollTop = body.scrollHeight;
}