// script.js
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();

    if (!userMessage) return;

    addMessage(userMessage, 'user-message');
    userInput.value = '';

    try {
        // THIS IS THE IMPORTANT CHANGE!
        // We are now calling our PHP script.
        const response = await fetch('chat_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const data = await response.json();
        const botMessage = data.reply;

        addMessage(botMessage, 'bot-message');

    } catch (error) {
        console.error('Error:', error);
        addMessage(`Sorry, something went wrong. ${error.message}`, 'bot-message');
    }
});

function addMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', className);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}