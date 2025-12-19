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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    #chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    #chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    #chat-messages::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    #chat-messages::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .message {
      display: flex;
      max-width: 85%;
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .message.user {
      align-self: flex-end;
      justify-content: flex-end;
    }
    .message.assistant {
      align-self: flex-start;
      justify-content: flex-start;
    }
    .message.employee {
      align-self: flex-start;
      justify-content: flex-start;
    }
    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .message.user .message-bubble {
      background: linear-gradient(135deg, #0b1220 0%, #1a2332 100%);
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(11, 18, 32, 0.2);
    }
    .message.assistant .message-bubble {
      background: #ffffff;
      color: #1e293b;
      border-bottom-left-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .message.employee .message-bubble {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #fff;
      border-bottom-left-radius: 4px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .message.employee .message-bubble::before {
      content: "👤 ";
    }
    .talk-to-human-btn {
      margin: 12px 0;
      padding: 12px 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .talk-to-human-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
    .talk-to-human-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .live-chat-status {
      padding: 10px 16px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      color: #0369a1;
      font-size: 13px;
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .live-chat-status.active {
      background: #dcfce7;
      border-color: #86efac;
      color: #166534;
    }
    .loading-indicator {
      display: flex;
      gap: 5px;
      padding: 12px 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      max-width: 70px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .loading-dot {
      width: 8px;
      height: 8px;
      background: #94a3b8;
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
        transform: scale(0.6);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #chat-input-container {
      border-top: 1px solid #e2e8f0;
      padding: 16px;
      background: #ffffff;
      display: flex;
      gap: 10px;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
    }
    #chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: all 0.2s;
      background: #f8fafc;
    }
    #chat-input:focus {
      border-color: #0b1220;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(11, 18, 32, 0.1);
    }
    #chat-input:disabled {
      background: #f1f5f9;
      cursor: not-allowed;
      opacity: 0.7;
    }
    #chat-send {
      padding: 12px 20px;
      background: linear-gradient(135deg, #0b1220 0%, #1a2332 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(11, 18, 32, 0.2);
    }
    #chat-send:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(11, 18, 32, 0.3);
    }
    #chat-send:active:not(:disabled) {
      transform: translateY(0);
    }
    #chat-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
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
        placeholder="Type your message..."
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
      let aiSessionId = null;
      let liveChatId = null;
      let chatMode = 'ai'; // 'ai' or 'live'
      let liveChatStatus = null; // 'pending' or 'active'
      let employeeName = null;
      let takenOver = false;
      let userId = \`user_\${Date.now()}_\${Math.random().toString(36).slice(2, 11)}\`;
      let pollInterval = null;
      let takeoverPollInterval = null;
      
      // Get API base URL from parent widget config
      let widgetApiUrl = '';
      const widgetScript = document.querySelector('script[data-api]');
      if (widgetScript) {
        widgetApiUrl = widgetScript.getAttribute('data-api') || '';
      }
      const finalApiUrl = widgetApiUrl || apiBaseUrl;
      
      // Create AI session on load
      async function createAISession() {
        try {
          const response = await fetch(\`\${finalApiUrl}/api/ai-chat/session\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            credentials: 'omit'
          });
          if (response.ok) {
            const session = await response.json();
            aiSessionId = session.id;
            console.log('[Widget] AI session created:', aiSessionId);
          }
        } catch (error) {
          console.error('[Widget] Failed to create AI session:', error);
        }
      }
      
      // Poll for takeover (when AI session is converted to live by an employee)
      function startTakeoverPolling() {
        if (takeoverPollInterval) clearInterval(takeoverPollInterval);
        if (chatMode !== 'ai' || !aiSessionId || takenOver) return;
        
        takeoverPollInterval = setInterval(async () => {
          try {
            const response = await fetch(\`\${finalApiUrl}/api/ai-chat/session?chatId=\${aiSessionId}\`, {
              credentials: 'omit'
            });
            if (response.ok) {
              const session = await response.json();
              if (session.chatMode === 'live' && session.employeeName) {
                // Takeover detected!
                takenOver = true;
                chatMode = 'live';
                liveChatId = aiSessionId;
                liveChatStatus = 'active';
                employeeName = session.employeeName;
                
                if (takeoverPollInterval) {
                  clearInterval(takeoverPollInterval);
                  takeoverPollInterval = null;
                }
                
                addMessage('assistant', \`🎉 \${session.employeeName} has joined the chat! You're now chatting with a human agent.\`);
                startLiveChatPolling();
              }
            }
          } catch (error) {
            console.error('[Widget] Takeover poll error:', error);
          }
        }, 3000);
      }
      
      // Poll for new messages in live chat mode
      function startLiveChatPolling() {
        if (pollInterval) clearInterval(pollInterval);
        if (chatMode !== 'live' || !liveChatId) return;
        
        const pollMessages = async () => {
          try {
            const response = await fetch(\`\${finalApiUrl}/api/live-chat/messages?chatId=\${liveChatId}\`, {
              credentials: 'omit'
            });
            if (response.ok) {
              const serverMessages = await response.json();
              const existingIds = new Set(messages.map(m => m.id));
              
              serverMessages.forEach(msg => {
                if (!existingIds.has(msg.id)) {
                  const message = {
                    id: msg.id,
                    role: msg.role === 'employee' ? 'employee' : msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.timestamp || Date.now())
                  };
                  messages.push(message);
                }
              });
              
              renderMessages();
              scrollToBottom();
            }
          } catch (error) {
            console.error('[Widget] Live chat poll error:', error);
          }
        };
        
        pollMessages();
        pollInterval = setInterval(pollMessages, 1500);
      }
      
      function addMessage(role, content) {
        const message = {
          id: \`msg_\${Date.now()}_\${Math.random().toString(36).slice(2, 9)}\`,
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
        
        // Show "Talk to Human" button if in AI mode and not taken over
        if (chatMode === 'ai' && !takenOver && messages.length > 0) {
          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = 'display: flex; justify-content: center; margin: 8px 0;';
          const talkBtn = document.createElement('button');
          talkBtn.className = 'talk-to-human-btn';
          talkBtn.disabled = isLoading;
          talkBtn.innerHTML = '👤 Talk to Human Agent';
          talkBtn.onclick = requestLiveChat;
          buttonContainer.appendChild(talkBtn);
          messagesContainer.appendChild(buttonContainer);
        }
        
        // Show live chat status
        if (chatMode === 'live') {
          const statusDiv = document.createElement('div');
          statusDiv.className = \`live-chat-status \${liveChatStatus === 'active' ? 'active' : ''}\`;
          if (liveChatStatus === 'active' && employeeName) {
            statusDiv.innerHTML = \`✅ Connected with \${employeeName}\`;
          } else {
            statusDiv.innerHTML = '⏳ Waiting for an agent to join...';
          }
          messagesContainer.appendChild(statusDiv);
        }
        
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
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }
      
      async function requestLiveChat() {
        if (isLoading) return;
        isLoading = true;
        renderMessages();
        
        try {
          const response = await fetch(\`\${finalApiUrl}/api/live-chat/session\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            credentials: 'omit'
          });
          
          if (!response.ok) throw new Error('Failed to create live chat session');
          
          const session = await response.json();
          liveChatId = session.id;
          liveChatStatus = session.status;
          chatMode = 'live';
          
          addMessage('assistant', "I've connected you with our office. An employee will be with you shortly. Please wait...");
          
          startLiveChatPolling();
        } catch (error) {
          console.error('[Widget] Live chat request error:', error);
          addMessage('assistant', 'Sorry, I couldn\'t connect you to an employee. Please try again or contact the association directly.');
        } finally {
          isLoading = false;
          renderMessages();
        }
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
          if (chatMode === 'live' && liveChatId) {
            // Send message to live chat
            const response = await fetch(\`\${finalApiUrl}/api/live-chat/messages\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId: liveChatId,
                role: 'user',
                content: text
              }),
              credentials: 'omit'
            });
            
            if (!response.ok) throw new Error('Failed to send message');
            // Polling will handle receiving the response
          } else {
            // Send message to AI chat
            const response = await fetch(\`\${finalApiUrl}/api/chat\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: messages.filter(m => m.role !== 'assistant' || m.content).map(m => ({
                  role: m.role === 'employee' ? 'assistant' : m.role,
                  content: m.content
                })),
                sessionId: aiSessionId,
                userMessage: text
              }),
              credentials: 'omit'
            });
            
            if (!response.ok) throw new Error('Failed to get response');
            
            const data = await response.json();
            
            // Check if AI wants to connect to live chat
            if (data.content && data.content.includes('[CONNECT_LIVE_CHAT]')) {
              const cleanContent = data.content.replace('[CONNECT_LIVE_CHAT]', '').trim();
              if (cleanContent) {
                addMessage('assistant', cleanContent);
              }
              await requestLiveChat();
              return;
            }
            
            addMessage('assistant', data.content);
          }
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
      
      // Initialize
      createAISession().then(() => {
        startTakeoverPolling();
      });
      
      // Add initial greeting
      addMessage('assistant', config.greeting);
      
      // Focus input
      setTimeout(() => input.focus(), 100);
      
      // Cleanup on unload
      window.addEventListener('beforeunload', () => {
        if (pollInterval) clearInterval(pollInterval);
        if (takeoverPollInterval) clearInterval(takeoverPollInterval);
      });
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
