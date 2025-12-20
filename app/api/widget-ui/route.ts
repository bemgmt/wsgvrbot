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

    // Return HTML with inline JavaScript for the chat UI - WordPress-friendly, optimized for older users
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <style>
    /* WordPress-friendly scoped styles - won't conflict with theme */
    #wsgvr-chat-widget * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    #wsgvr-chat-widget {
      font-family: Arial, Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      overflow: hidden;
    }
    #wsgvr-chat-header {
      padding: 22px 24px;
      background: #1e5a96;
      color: #ffffff;
      flex-shrink: 0;
      border-bottom: 3px solid #0d4a7a;
    }
    #wsgvr-chat-header h3 {
      font-size: 22px;
      font-weight: bold;
      margin: 0 0 6px 0;
      line-height: 1.3;
      color: #ffffff;
    }
    #wsgvr-chat-header p {
      font-size: 16px;
      margin: 0;
      line-height: 1.4;
      color: #ffffff;
      opacity: 0.95;
    }
    #wsgvr-mode-indicator {
      border-bottom: 2px solid #cccccc;
      padding: 16px 20px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .wsgvr-mode-text {
      font-size: 15px;
      color: #333333;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
    .wsgvr-mode-btn {
      font-size: 15px;
      min-height: 44px;
      padding: 12px 20px;
      border: 2px solid #1e5a96;
      border-radius: 6px;
      background: #ffffff;
      color: #1e5a96;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      text-decoration: none;
    }
    .wsgvr-mode-btn:hover:not(:disabled) {
      background: #1e5a96;
      color: #ffffff;
    }
    .wsgvr-mode-btn:focus {
      outline: 3px solid #ff9900;
      outline-offset: 2px;
    }
    .wsgvr-mode-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .wsgvr-mode-btn.ghost {
      border: 2px solid #666666;
      background: transparent;
      color: #666666;
    }
    .wsgvr-mode-btn.ghost:hover:not(:disabled) {
      background: #f0f0f0;
      border-color: #333333;
      color: #333333;
    }
    #wsgvr-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9f9f9;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    #wsgvr-chat-messages::-webkit-scrollbar {
      width: 12px;
    }
    #wsgvr-chat-messages::-webkit-scrollbar-track {
      background: #e0e0e0;
    }
    #wsgvr-chat-messages::-webkit-scrollbar-thumb {
      background: #1e5a96;
      border-radius: 6px;
    }
    #wsgvr-chat-messages::-webkit-scrollbar-thumb:hover {
      background: #0d4a7a;
    }
    .wsgvr-message {
      display: flex;
      animation: wsgvr-fadeIn 0.3s ease-out;
    }
    .wsgvr-message.user {
      justify-content: flex-end;
    }
    .wsgvr-message.assistant, .wsgvr-message.employee {
      justify-content: flex-start;
    }
    .wsgvr-message-bubble {
      max-width: 80%;
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 16px;
      line-height: 1.6;
      word-wrap: break-word;
      white-space: pre-wrap;
      border: 2px solid transparent;
    }
    .wsgvr-message.user .wsgvr-message-bubble {
      background: #1e5a96;
      color: #ffffff;
      border-color: #0d4a7a;
    }
    .wsgvr-message.assistant .wsgvr-message-bubble {
      background: #ffffff;
      color: #000000;
      border: 2px solid #cccccc;
    }
    .wsgvr-message.employee .wsgvr-message-bubble {
      background: #1e5a96;
      color: #ffffff;
      border-color: #0d4a7a;
    }
    .wsgvr-employee-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .wsgvr-loading-indicator {
      display: flex;
      gap: 8px;
      padding: 14px 18px;
      background: #ffffff;
      border: 2px solid #cccccc;
      border-radius: 8px;
      max-width: 90px;
    }
    .wsgvr-loading-dot {
      width: 12px;
      height: 12px;
      background: #1e5a96;
      border-radius: 50%;
      animation: wsgvr-bounce 1.4s infinite ease-in-out;
    }
    .wsgvr-loading-dot:nth-child(1) {
      animation-delay: -0.32s;
    }
    .wsgvr-loading-dot:nth-child(2) {
      animation-delay: -0.16s;
    }
    @keyframes wsgvr-bounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.7;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes wsgvr-fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #wsgvr-chat-input-container {
      border-top: 3px solid #cccccc;
      padding: 18px 20px;
      background: #ffffff;
      display: flex;
      gap: 12px;
      flex-shrink: 0;
      align-items: center;
    }
    #wsgvr-chat-input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #cccccc;
      border-radius: 6px;
      font-size: 16px;
      font-family: Arial, Helvetica, sans-serif;
      outline: none;
      transition: border-color 0.2s;
      background: #ffffff;
      color: #000000;
      min-height: 50px;
    }
    #wsgvr-chat-input:focus {
      border-color: #1e5a96;
      border-width: 3px;
      box-shadow: 0 0 0 3px rgba(30, 90, 150, 0.2);
    }
    #wsgvr-chat-input:disabled {
      background: #f0f0f0;
      cursor: not-allowed;
      opacity: 0.7;
    }
    #wsgvr-chat-input::placeholder {
      color: #666666;
      font-size: 16px;
    }
    #wsgvr-chat-send {
      min-width: 56px;
      min-height: 56px;
      padding: 0;
      background: #ff9900;
      color: #ffffff;
      border: 3px solid #e68900;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: bold;
    }
    #wsgvr-chat-send:hover:not(:disabled) {
      background: #e68900;
      border-color: #cc7700;
      transform: scale(1.05);
    }
    #wsgvr-chat-send:focus {
      outline: 3px solid #ff9900;
      outline-offset: 3px;
    }
    #wsgvr-chat-send:active:not(:disabled) {
      transform: scale(1);
    }
    #wsgvr-chat-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    #wsgvr-chat-send svg {
      width: 24px;
      height: 24px;
      stroke-width: 3;
    }
  </style>
  <div id="wsgvr-chat-widget">
    <div id="wsgvr-chat-header">
      <h3 id="wsgvr-chat-header-title">REALTORS® Assistant</h3>
      <p id="wsgvr-chat-header-subtitle">West San Gabriel Valley</p>
    </div>
    <div id="wsgvr-mode-indicator"></div>
    <div id="wsgvr-chat-messages"></div>
    <div id="wsgvr-chat-input-container">
      <input
        type="text"
        id="wsgvr-chat-input"
        placeholder="Ask me anything..."
        autocomplete="off"
        aria-label="Type your message"
      />
      <button id="wsgvr-chat-send" type="button" aria-label="Send message">
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
      const messagesContainer = document.getElementById('wsgvr-chat-messages');
      const input = document.getElementById('wsgvr-chat-input');
      const sendButton = document.getElementById('wsgvr-chat-send');
      const headerTitle = document.getElementById('wsgvr-chat-header-title');
      const headerSubtitle = document.getElementById('wsgvr-chat-header-subtitle');
      const modeIndicator = document.getElementById('wsgvr-mode-indicator');
      
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
          text.className = 'wsgvr-mode-text';
          text.innerHTML = '🤖 AI Assistant';
          
          const button = document.createElement('button');
          button.className = 'wsgvr-mode-btn';
          button.disabled = isLoading;
          button.innerHTML = '👥 Talk to Human';
          button.onclick = requestLiveChat;
          button.setAttribute('aria-label', 'Talk to a human agent');
          
          modeIndicator.appendChild(text);
          modeIndicator.appendChild(button);
        } else if (chatMode === 'live') {
          const text = document.createElement('span');
          text.className = 'wsgvr-mode-text';
          if (liveChatStatus === 'pending') {
            text.innerHTML = '👥 ⏳ Waiting for employee...';
          } else {
            text.innerHTML = '👥 ✅ Connected' + (employeeName ? ' with ' + employeeName : '');
          }
          
          const button = document.createElement('button');
          button.className = 'wsgvr-mode-btn ghost';
          button.innerHTML = 'Switch to AI';
          button.onclick = resetToAI;
          button.setAttribute('aria-label', 'Switch back to AI assistant');
          
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
          messageDiv.className = 'wsgvr-message ' + msg.role;
          
          const bubble = document.createElement('div');
          bubble.className = 'wsgvr-message-bubble';
          
          if (msg.role === 'employee' && msg.employeeName) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'wsgvr-employee-name';
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
          loadingDiv.className = 'wsgvr-message assistant';
          loadingDiv.innerHTML = '<div class="wsgvr-loading-indicator"><div class="wsgvr-loading-dot"></div><div class="wsgvr-loading-dot"></div><div class="wsgvr-loading-dot"></div></div>';
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
