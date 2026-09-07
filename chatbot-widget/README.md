# Arti Air Con - AI Chatbot Widget

This directory contains the production-ready, standalone AI Chatbot widget for Arti Air Con. It features a modern glassmorphism UI, mobile responsiveness, and connects to a Node.js Express backend that uses Google Gemini 1.5 Flash.

## Structure
- `index.html`: The frontend demo page containing the widget markup.
- `style.css`: Premium, responsive CSS styles for the widget.
- `script.js`: Frontend logic for handling UI state and API requests.
- `server.js`: Node.js Express backend script.
- `package.json`: Backend dependencies.

## 1. Setting Up the Backend

The backend is responsible for securely communicating with the Google Gemini API and managing the chatbot's system prompt.

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Steps
1. Navigate to the backend directory:
   ```bash
   cd "chatbot-widget"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `chatbot-widget` directory and add your API key:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The backend will now run on `http://localhost:3001`.

## 2. Setting Up the Frontend

The frontend is built with pure HTML, CSS, and JS, making it extremely easy to embed anywhere.

### Running the Demo locally
You can simply double-click `index.html` to open it in your browser. As long as the backend is running, the chat will work immediately!

### Embedding into an Existing Website (e.g., WordPress, Next.js, plain HTML)

To integrate this widget into your actual `artiair.com` website:

1. **Include CSS & Icons** inside your website's `<head>` tag:
   ```html
   <link rel="stylesheet" href="path/to/style.css">
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
   ```

2. **Paste the Widget HTML** right before the closing `</body>` tag of your website:
   ```html
   <!-- START OF ARTI AIR CHAT WIDGET -->
   <div id="arti-chat-widget-container">
       <button id="arti-chat-launcher" aria-label="Open Chat">
           <i class="fas fa-comment-dots"></i>
       </button>
       <div id="arti-chat-window" class="hidden">
           <!-- ... (Copy the full internal contents from index.html) ... -->
       </div>
   </div>
   <!-- END OF ARTI AIR CHAT WIDGET -->
   ```

3. **Include the JavaScript** right after the HTML snippet (before `</body>`):
   ```html
   <script src="path/to/script.js"></script>
   ```

4. **Update the API URL** inside `script.js`:
   When you deploy your backend to a server (like Render, Heroku, or Vercel), open `script.js` and change the URL:
   ```javascript
   // Change this:
   const API_URL = 'http://localhost:3001/api/chat';
   
   // To your production URL:
   // const API_URL = 'https://your-backend-domain.com/api/chat';
   ```

## Design & Features Highlights
- **Glassmorphism**: The UI uses `backdrop-filter: blur(16px)` for a highly premium, frosted-glass look.
- **Mobile Responsive**: On devices under 480px, the chat window expands to fill most of the screen gracefully.
- **Intelligent LLM Prompts**: The backend contains detailed pricing, locations, emergency protocols, and Hinglish understanding capabilities as requested.
- **Lead Capture Hook**: `server.js` contains a heuristic to detect when a lead is captured (name, phone, etc.) and logs a mock payload. This can be easily replaced with an API call to a CRM.
