import { NextRequest, NextResponse } from "next/server"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const client = searchParams.get("client") || "default"

    // Fetch widget config from widget-config endpoint for multi-tenant support
    let config = {
      client,
      greeting: "Hello! How can I help you today?",
      title: "Support",
      subtitle: "Chat Assistant",
      primaryColor: "#0b1220",
    }

    try {
      const baseUrl = request.nextUrl.origin
      const configResponse = await fetch(`${baseUrl}/api/widget-config?client=${encodeURIComponent(client)}`)
      if (configResponse.ok) {
        const fetchedConfig = await configResponse.json()
        config = { ...config, ...fetchedConfig }
      }
    } catch (configError) {
      console.warn("[Widget UI] Failed to fetch config, using defaults:", configError)
      // Continue with default config
    }

    // Return HTML with inline JavaScript for the chat UI
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    #chat-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }
    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message {
      display: flex;
      max-width: 80%;
      animation: fadeIn 0.3s;
    }
    .message.user {
      align-self: flex-end;
      justify-content: flex-end;
    }
    .message.assistant {
      align-self: flex-start;
      justify-content: flex-start;
    }
    .message-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .message.user .message-bubble {
      background: #0b1220;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .message.assistant .message-bubble {
      background: #e5e7eb;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    .loading-indicator {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #e5e7eb;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      max-width: 60px;
    }
    .loading-dot {
      width: 8px;
      height: 8px;
      background: #6b7280;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }
    .loading-dot:nth-child(1) {
      animation-delay: -0.32s;
    }
    .loading-dot:nth-child(2) {
      animation-delay: -0.16s;
    }
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #chat-input-container {
      border-top: 1px solid #e5e7eb;
      padding: 12px;
      background: #fff;
      display: flex;
      gap: 8px;
    }
    #chat-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    #chat-input:focus {
      border-color: #0b1220;
    }
    #chat-input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
    #chat-send {
      padding: 10px 16px;
      background: #0b1220;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #chat-send:hover:not(:disabled) {
      background: #1a2332;
    }
    #chat-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    #chat-send svg {
      width: 18px;
      height: 18px;
    }
  </style>
</head>
<body>
  <div id="chat-container">
    <div id="chat-messages"></div>
    <div id="chat-input-container">
      <input
        type="text"
        id="chat-input"
        placeholder="Ask me anything..."
        autocomplete="off"
      />
      <button id="chat-send" type="button" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
  <script>
    (function() {
      const config = ${JSON.stringify(config)};
      const apiBaseUrl = window.location.origin;
      const messagesContainer = document.getElementById('chat-messages');
      const input = document.getElementById('chat-input');
      const sendButton = document.getElementById('chat-send');
      
      let messages = [];
      let isLoading = false;
      
      // Get API base URL from parent widget config
      let widgetApiUrl = '';
      const widgetScript = document.querySelector('script[data-api]');
      if (widgetScript) {
        widgetApiUrl = widgetScript.getAttribute('data-api') || '';
      }
      const finalApiUrl = widgetApiUrl || apiBaseUrl;
      
      function addMessage(role, content) {
        const message = {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date()
        };
        messages.push(message);
        renderMessages();
        scrollToBottom();
      }
      
      function renderMessages() {
        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
          const messageDiv = document.createElement('div');
          messageDiv.className = \`message \${msg.role}\`;
          
          const bubble = document.createElement('div');
          bubble.className = 'message-bubble';
          bubble.textContent = msg.content;
          
          messageDiv.appendChild(bubble);
          messagesContainer.appendChild(messageDiv);
        });
        
        if (isLoading) {
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'message assistant';
          loadingDiv.innerHTML = \`
            <div class="loading-indicator">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </div>
          \`;
          messagesContainer.appendChild(loadingDiv);
        }
      }
      
      function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      async function sendMessage() {
        const text = input.value.trim();
        if (!text || isLoading) return;
        
        addMessage('user', text);
        input.value = '';
        isLoading = true;
        sendButton.disabled = true;
        input.disabled = true;
        renderMessages();
        scrollToBottom();
        
        try {
          const response = await fetch(\`\${finalApiUrl}/api/chat\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: messages.filter(m => m.role !== 'assistant' || m.content).map(m => ({
                role: m.role,
                content: m.content
              }))
            }),
            credentials: 'omit'
          });
          
          if (!response.ok) throw new Error('Failed to get response');
          
          const data = await response.json();
          addMessage('assistant', data.content);
        } catch (error) {
          console.error('[Widget] Chat error:', error);
          addMessage('assistant', 'Sorry, I encountered an error. Please try again or contact the association directly.');
        } finally {
          isLoading = false;
          sendButton.disabled = false;
          input.disabled = false;
          input.focus();
        }
      }
      
      sendButton.addEventListener('click', sendMessage);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      
      // Add initial greeting
      addMessage('assistant', config.greeting);
      
      // Focus input
      setTimeout(() => input.focus(), 100);
    })();
  </script>
</body>
</html>
    `.trim()

    return new NextResponse(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[Widget UI] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate widget UI" },
      { status: 500, headers: corsHeaders }
    )
  }
}

