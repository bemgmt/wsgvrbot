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

    // Fetch widget config
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
      console.warn("[Widget UI JS] Failed to fetch config, using defaults:", configError)
    }

    // Return JavaScript as a module that can be safely loaded
    const js = `
(function() {
  const config = ${JSON.stringify(config)};
  const apiBaseUrl = window.location.origin;
  
  // Get API base URL from parent widget config
  let widgetApiUrl = '';
  const widgetScript = document.querySelector('script[data-api]');
  if (widgetScript) {
    widgetApiUrl = widgetScript.getAttribute('data-api') || '';
  }
  const finalApiUrl = widgetApiUrl || apiBaseUrl;
  
  // Helper function to build API URLs (handles double /api/ issue)
  function buildApiUrl(path) {
    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Remove trailing slash from base URL if present
    let cleanBase = finalApiUrl;
    if (cleanBase.endsWith('/')) {
      cleanBase = cleanBase.slice(0, -1);
    }
    // Check if base URL already ends with /api
    if (cleanBase.endsWith('/api')) {
      // Base already has /api, so just append the path
      return cleanBase + '/' + cleanPath;
    } else {
      // Base doesn't have /api, so add it
      return cleanBase + '/api/' + cleanPath;
    }
  }
  
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
  
  // Create messagesEndRef for scrolling
  const messagesEndRef = document.createElement('div');
  messagesEndRef.style.cssText = 'height: 1px;';
  
  // Update header based on config
  if (headerTitle) {
    headerTitle.textContent = config.title || 'REALTORS® Assistant';
  }
  if (headerSubtitle) {
    headerSubtitle.textContent = config.subtitle || 'West San Gabriel Valley';
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
  
  let messages = [];
  let isLoading = false;
  let aiSessionId = null;
  let liveChatId = null;
  let chatMode = 'ai';
  let liveChatStatus = null;
  let employeeName = null;
  let takenOver = false;
  let userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  let pollInterval = null;
  let takeoverPollInterval = null;
  
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
      renderModeIndicator();
      startLiveChatPolling();
          }
        }
      } catch (error) {
        console.error('[Widget] Takeover poll error:', error);
      }
    }, 3000);
  }
  
  // Poll for live chat messages and status updates (like original)
  let previousLiveChatStatus = null;
  let previousEmployeeName = null;
  
  function startLiveChatPolling() {
    if (pollInterval) clearInterval(pollInterval);
    if (chatMode !== 'live' || !liveChatId) return;
    
    const pollMessages = async () => {
      try {
        // Poll the session endpoint to get status updates and employee info (like original)
        const sessionResponse = await fetch(buildApiUrl('live-chat/session') + '?chatId=' + encodeURIComponent(liveChatId), {
          credentials: 'omit'
        });
        if (!sessionResponse.ok) {
          console.error('[Widget] Live chat poll failed:', sessionResponse.status);
          return;
        }
        
        const session = await sessionResponse.json();
        
        // Check if employee just joined (for manually requested live chats, not takeovers)
        const wasPending = previousLiveChatStatus === 'pending';
        const isNowActive = session.status === 'active';
        const hasNewEmployee = session.employeeName && 
          session.employeeName !== previousEmployeeName &&
          !takenOver;
        
        if (wasPending && isNowActive && hasNewEmployee) {
          // Employee just joined
          addMessage('assistant', '🎉 ' + session.employeeName + ' has joined the chat! You\\'re now chatting with a human agent.');
        }
        
        // Update status
        liveChatStatus = session.status;
        previousLiveChatStatus = session.status;
        
        // Update employee name if we have it
        if (session.employeeName) {
          employeeName = session.employeeName;
          previousEmployeeName = session.employeeName;
        }
        
        // Update header and mode indicator
        updateHeader();
        renderModeIndicator();
        
        // Sync messages from server
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
      
      // Add employee name if present
      if (msg.role === 'employee' && msg.employeeName) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'message-employee-name';
        nameDiv.textContent = msg.employeeName;
        bubble.appendChild(nameDiv);
      }
      
      const contentDiv = document.createElement('p');
      contentDiv.style.cssText = 'font-size: 14px; line-height: 1.5; margin: 0;';
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
    
    // Add scroll anchor
    messagesContainer.appendChild(messagesEndRef);
  }
  
  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  
  // Function to render mode indicator
  function renderModeIndicator() {
    if (!modeIndicator) return;
    
    modeIndicator.innerHTML = '';
    modeIndicator.className = 'mode-indicator';
    
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
    
    // Clear messages and add greeting
    messages = [];
    addMessage('assistant', config.greeting);
    updateHeader();
    renderModeIndicator();
    
    // Restart AI session if needed
    if (!aiSessionId) {
      createAISession().then(() => {
        startTakeoverPolling();
      });
    } else {
      startTakeoverPolling();
    }
  }
  
  async function requestLiveChat() {
    if (isLoading) return;
    isLoading = true;
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
  
  // Initialize header and placeholder
  updateHeader();
  addMessage('assistant', config.greeting);
  renderModeIndicator();
  
  setTimeout(() => input.focus(), 100);
  
  window.addEventListener('beforeunload', () => {
    if (pollInterval) clearInterval(pollInterval);
    if (takeoverPollInterval) clearInterval(takeoverPollInterval);
  });
})();
    `.trim()

    return new NextResponse(js, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/javascript; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[Widget UI JS] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate widget UI JS" },
      { status: 500, headers: corsHeaders }
    )
  }
}

