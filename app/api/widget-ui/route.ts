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
      primaryColor: "#1e5a96",
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
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #chat-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      overflow: hidden;
    }
    #chat-header {
      padding: 18px 20px;
      background: #1e5a96;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    #chat-header h3 {
      font-size: 17px;
      font-weight: 600;
      margin: 0 0 3px 0;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    #chat-header p {
      font-size: 13px;
      opacity: 0.95;
      margin: 0;
      line-height: 1.4;
      font-weight: 400;
    }
    #mode-indicator {
      border-bottom: 1px solid #e8e8e8;
      padding: 10px 16px;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .mode-indicator-text {
      font-size: 12px;
      color: #555555;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }
    .mode-indicator-btn {
      font-size: 11px;
      height: 28px;
      padding: 0 12px;
      border: 1px solid #d0d0d0;
      border-radius: 6px;
      background: #ffffff;
      color: #1e5a96;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .mode-indicator-btn:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #1e5a96;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .mode-indicator-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    .mode-indicator-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .mode-indicator-btn.ghost {
      border: none;
      background: transparent;
      color: #666666;
      box-shadow: none;
    }
    .mode-indicator-btn.ghost:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);
      transform: none;
    }
    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      animation: fadeIn 0.25s ease-out;
    }
    .message.user {
      justify-content: flex-end;
    }
    .message.assistant, .message.employee {
      justify-content: flex-start;
    }
    .message-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }
    .message.user .message-bubble {
      background: #1e5a96;
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    .message.assistant .message-bubble {
      background: #ffffff;
      color: #333333;
      border: 1px solid #e8e8e8;
      border-bottom-left-radius: 4px;
    }
    .message.employee .message-bubble {
      background: #1e5a96;
      color: #ffffff;
      border-bottom-left-radius: 4px;
      opacity: 0.95;
    }
    .message-employee-name {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 4px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .loading-indicator {
      display: flex;
      gap: 6px;
      padding: 10px 14px;
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      max-width: 70px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }
    .loading-dot {
      width: 7px;
      height: 7px;
      background: #1e5a96;
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
        transform: scale(0.7);
        opacity: 0.6;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #chat-input-container {
      border-top: 1px solid #e8e8e8;
      padding: 14px 16px;
      background: #ffffff;
      display: flex;
      gap: 10px;
      flex-shrink: 0;
      align-items: center;
    }
    #chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #d0d0d0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
      background: #ffffff;
      color: #333333;
    }
    #chat-input:focus {
      border-color: #1e5a96;
      box-shadow: 0 0 0 3px rgba(30, 90, 150, 0.1);
    }
    #chat-input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
      opacity: 0.6;
    }
    #chat-input::placeholder {
      color: #999999;
    }
    #chat-send {
      width: 40px;
      height: 40px;
      padding: 0;
      background: #ff9900;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(255, 153, 0, 0.3);
    }
    #chat-send:hover:not(:disabled) {
      background: #e68900;
      transform: translateY(-1px);
      box-shadow: 0 3px 6px rgba(255, 153, 0, 0.4);
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
      stroke-width: 2.5;
    }
  </style>
</head>
<body>
  <div id="chat-container">
    <div id="chat-header">
      <h3 id="chat-header-title">REALTORS® Assistant</h3>
      <p id="chat-header-subtitle">West San Gabriel Valley</p>
    </div>
    <div id="mode-indicator"></div>
    <div id="chat-messages"></div>
    <div id="chat-input-container">
      <input
        type="text"
        id="chat-input"
        placeholder="Ask me anything..."
        autocomplete="off"
      />
      <button id="chat-send" type="button" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
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
      const headerTitle = document.getElementById('chat-header-title');
      const headerSubtitle = document.getElementById('chat-header-subtitle');
      const modeIndicator = document.getElementById('mode-indicator');
      
      if (!messagesContainer || !input || !sendButton) {
        console.error('[Widget] Required elements not found');
        return;
      }
      
      // Function to update header based on chat mode
      function updateHeader() {
        if (!headerTitle || !headerSubtitle) return;
        
        if (chatMode === 'live') {
          headerTitle.textContent = 'Live Chat';
          if (employeeName) {
            headerSubtitle.textContent = 'Chatting with ' + employeeName;
          } else if (liveChatStatus === 'pending') {
            headerSubtitle.textContent = 'Waiting for employee...';
          } else {
            headerSubtitle.textContent = config.subtitle || 'West San Gabriel Valley';
          }
        } else {
          headerTitle.textContent = config.title || 'REALTORS® Assistant';
          headerSubtitle.textContent = config.subtitle || 'West San Gabriel Valley';
        }
        
        // Update input placeholder
        if (chatMode === 'live' && liveChatStatus === 'pending') {
          input.placeholder = 'Waiting for employee to join...';
          input.disabled = true;
        } else if (chatMode === 'live') {
          input.placeholder = 'Type your message...';
          input.disabled = false;
        } else {
          input.placeholder = 'Ask me anything...';
          input.disabled = false;
        }
      }
      
      // Function to render mode indicator
      function renderModeIndicator() {
        if (!modeIndicator) return;
        
        modeIndicator.innerHTML = '';
        
        if (chatMode === 'ai') {
          const text = document.createElement('span');
          text.className = 'mode-indicator-text';
          text.innerHTML = '🤖 AI Assistant';
          
          const button = document.createElement('button');
          button.className = 'mode-indicator-btn';
          button.disabled = isLoading;
          button.innerHTML = '👥 Talk to Human';
          button.onclick = requestLiveChat;
          
          modeIndicator.appendChild(text);
          modeIndicator.appendChild(button);
        } else if (chatMode === 'live') {
          const text = document.createElement('span');
          text.className = 'mode-indicator-text';
          if (liveChatStatus === 'pending') {
            text.innerHTML = '👥 ⏳ Waiting for employee...';
          } else {
            text.innerHTML = '👥 ✅ Connected' + (employeeName ? ' with ' + employeeName : '');
          }
          
          const button = document.createElement('button');
          button.className = 'mode-indicator-btn ghost';
          button.innerHTML = 'Switch to AI';
          button.onclick = resetToAI;
          
          modeIndicator.appendChild(text);
          modeIndicator.appendChild(button);
        }
      }
      
      function resetToAI() {
        chatMode = 'ai';
        liveChatId = null;
        liveChatStatus = null;
        employeeName = null;
        takenOver = false;
        previousLiveChatStatus = null;
        previousEmployeeName = null;
        
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        
        messages = [];
        addMessage('assistant', config.greeting);
        updateHeader();
        renderModeIndicator();
        
        if (!aiSessionId) {
          createAISession().then(() => {
            startTakeoverPolling();
          });
        } else {
          startTakeoverPolling();
        }
      }
      
      let messages = [];
      let isLoading = false;
      let aiSessionId = null;
      let liveChatId = null;
      let chatMode = 'ai';
      let liveChatStatus = null;
      let employeeName = null;
      let takenOver = false;
      let userId = \`user_\${Date.now()}_\${Math.random().toString(36).slice(2, 11)}\`;
      let pollInterval = null;
      let takeoverPollInterval = null;
      let previousLiveChatStatus = null;
      let previousEmployeeName = null;
      
      // Get API base URL from parent widget config
      let widgetApiUrl = '';
      const widgetScript = document.querySelector('script[data-api]');
      if (widgetScript) {
        widgetApiUrl = widgetScript.getAttribute('data-api') || '';
      }
      const finalApiUrl = widgetApiUrl || apiBaseUrl;
      
      // Helper function to build API URLs
      function buildApiUrl(path) {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        let cleanBase = finalApiUrl;
        if (cleanBase.endsWith('/')) {
          cleanBase = cleanBase.slice(0, -1);
        }
        if (cleanBase.endsWith('/api')) {
          return cleanBase + '/' + cleanPath;
        } else {
          return cleanBase + '/api/' + cleanPath;
        }
      }
      
      // Create AI session on load
      async function createAISession() {
        try {
          const response = await fetch(buildApiUrl('ai-chat/session'), {
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
      
      // Poll for takeover
      function startTakeoverPolling() {
        if (takeoverPollInterval) clearInterval(takeoverPollInterval);
        if (chatMode !== 'ai' || !aiSessionId || takenOver) return;
        
        takeoverPollInterval = setInterval(async () => {
          try {
            const response = await fetch(buildApiUrl('ai-chat/session') + '?chatId=' + encodeURIComponent(aiSessionId), {
              credentials: 'omit'
            });
            if (response.ok) {
              const session = await response.json();
              if (session.chatMode === 'live' && session.employeeName) {
                takenOver = true;
                chatMode = 'live';
                liveChatId = aiSessionId;
                liveChatStatus = 'active';
                employeeName = session.employeeName;
                
                if (takeoverPollInterval) {
                  clearInterval(takeoverPollInterval);
                  takeoverPollInterval = null;
                }
                
                addMessage('assistant', '🎉 ' + session.employeeName + ' has joined the chat! You\\'re now chatting with a human agent.');
                updateHeader();
                renderModeIndicator();
                startLiveChatPolling();
              }
            }
          } catch (error) {
            console.error('[Widget] Takeover poll error:', error);
          }
        }, 3000);
      }
      
      // Poll for live chat messages and status updates
      function startLiveChatPolling() {
        if (pollInterval) clearInterval(pollInterval);
        if (chatMode !== 'live' || !liveChatId) return;
        
        const pollMessages = async () => {
          try {
            const sessionResponse = await fetch(buildApiUrl('live-chat/session') + '?chatId=' + encodeURIComponent(liveChatId), {
              credentials: 'omit'
            });
            if (!sessionResponse.ok) {
              console.error('[Widget] Live chat poll failed:', sessionResponse.status);
              return;
            }
            
            const session = await sessionResponse.json();
            
            const wasPending = previousLiveChatStatus === 'pending';
            const isNowActive = session.status === 'active';
            const hasNewEmployee = session.employeeName && 
              session.employeeName !== previousEmployeeName &&
              !takenOver;
            
            if (wasPending && isNowActive && hasNewEmployee) {
              addMessage('assistant', '🎉 ' + session.employeeName + ' has joined the chat! You\\'re now chatting with a human agent.');
            }
            
            liveChatStatus = session.status;
            previousLiveChatStatus = session.status;
            
            if (session.employeeName) {
              employeeName = session.employeeName;
              previousEmployeeName = session.employeeName;
            }
            
            updateHeader();
            renderModeIndicator();
            
            if (session.messages && session.messages.length > 0) {
              const existingIds = new Set(messages.map(m => m.id));
              
              session.messages.forEach(msg => {
                if (!existingIds.has(msg.id)) {
                  const message = {
                    id: msg.id,
                    role: msg.role === 'employee' ? 'employee' : msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.timestamp || Date.now()),
                    employeeName: msg.employeeName
                  };
                  messages.push(message);
                }
              });
            }
            
            renderMessages();
            scrollToBottom();
          } catch (error) {
            console.error('[Widget] Live chat poll error:', error);
          }
        };
        
        pollMessages();
        pollInterval = setInterval(pollMessages, 1500);
      }
      
      function addMessage(role, content) {
        const message = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
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
          messageDiv.className = 'message ' + msg.role;
          
          const bubble = document.createElement('div');
          bubble.className = 'message-bubble';
          
          if (msg.role === 'employee' && msg.employeeName) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'message-employee-name';
            nameDiv.textContent = msg.employeeName;
            bubble.appendChild(nameDiv);
          }
          
          const contentDiv = document.createElement('div');
          contentDiv.textContent = msg.content;
          bubble.appendChild(contentDiv);
          
          messageDiv.appendChild(bubble);
          messagesContainer.appendChild(messageDiv);
        });
        
        if (isLoading) {
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'message assistant';
          loadingDiv.innerHTML = '<div class="loading-indicator"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
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
        renderModeIndicator();
        renderMessages();
        
        try {
          const response = await fetch(buildApiUrl('live-chat/session'), {
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
          previousLiveChatStatus = session.status;
          
          updateHeader();
          renderModeIndicator();
          addMessage('assistant', 'I\\'ve connected you with our office. An employee will be with you shortly. Please wait...');
          
          startLiveChatPolling();
        } catch (error) {
          console.error('[Widget] Live chat request error:', error);
          addMessage('assistant', 'Sorry, I couldn\\'t connect you to an employee. Please try again or contact the association directly.');
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
            const response = await fetch(buildApiUrl('live-chat/messages'), {
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
          } else {
            const response = await fetch(buildApiUrl('chat'), {
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
      
      createAISession().then(() => {
        startTakeoverPolling();
      });
      
      updateHeader();
      addMessage('assistant', config.greeting);
      renderModeIndicator();
      
      setTimeout(() => input.focus(), 100);
      
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
