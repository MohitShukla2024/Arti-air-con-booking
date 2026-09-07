document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.getElementById('arti-chat-launcher');
    const window = document.getElementById('arti-chat-window');
    const closeBtn = document.getElementById('arti-chat-close');
    const chatForm = document.getElementById('arti-chat-form');
    const chatInput = document.getElementById('arti-chat-input');
    const chatBody = document.getElementById('arti-chat-body');
    const sendBtn = document.getElementById('arti-chat-send');
    const quickActionsContainer = document.getElementById('arti-quick-actions');

    // Replace with your actual backend URL when deploying
    const API_URL = 'http://localhost:3001/api/chat';
    
    // Store chat history context
    let chatHistory = [];

    // Toggle Chat Window
    function toggleChat() {
        window.classList.toggle('hidden');
        if (!window.classList.contains('hidden')) {
            setTimeout(() => chatInput.focus(), 300);
        }
    }

    launcher.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Render a message in the chat body
    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `arti-message arti-${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'arti-message-content';
        
        // Simple markdown parsing for bold text (**text**) and newlines
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        contentDiv.innerHTML = formattedText;
        msgDiv.appendChild(contentDiv);
        
        // Insert before quick actions if they exist, otherwise append to body
        if (quickActionsContainer) {
            chatBody.insertBefore(msgDiv, quickActionsContainer);
        } else {
            chatBody.appendChild(msgDiv);
        }
        
        scrollToBottom();
    }

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Show/Hide Typing Indicator
    let typingIndicator = null;
    function showTyping() {
        if (typingIndicator) return;
        
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'arti-message arti-bot-message arti-typing-container';
        typingIndicator.innerHTML = `
            <div class="arti-typing-indicator">
                <div class="arti-typing-dot"></div>
                <div class="arti-typing-dot"></div>
                <div class="arti-typing-dot"></div>
            </div>
        `;
        
        if (quickActionsContainer) {
            chatBody.insertBefore(typingIndicator, quickActionsContainer);
        } else {
            chatBody.appendChild(typingIndicator);
        }
        scrollToBottom();
    }

    function hideTyping() {
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
    }

    // Handle Form Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Hide quick actions after first interaction
        if (quickActionsContainer && quickActionsContainer.style.display !== 'none') {
            quickActionsContainer.style.display = 'none';
        }

        // Add user message to UI and history
        appendMessage('user', text);
        chatHistory.push({ sender: 'user', text: text });
        
        chatInput.value = '';
        sendBtn.disabled = true;

        showTyping();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    history: chatHistory 
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            hideTyping();
            
            if (data.response) {
                appendMessage('bot', data.response);
                chatHistory.push({ sender: 'bot', text: data.response });
            } else {
                throw new Error('Empty response from server');
            }

        } catch (error) {
            console.error('Error:', error);
            hideTyping();
            appendMessage('bot', "I'm sorry, I'm having trouble connecting right now. Please call us at +91 9264173334 for immediate assistance.");
        } finally {
            sendBtn.disabled = false;
            chatInput.focus();
        }
    });

    // Quick Actions
    document.querySelectorAll('.arti-quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.textContent;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });
});
