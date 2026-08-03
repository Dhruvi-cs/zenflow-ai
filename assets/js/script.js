/* 
  NOTE FOR TEAM: This dummy chat function was commented out because live 
  AI chat logic is now handled in ai-chat.html, which connects directly 
  to the Node.js backend route (/api/ai/chat).
*/
/*
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
    */