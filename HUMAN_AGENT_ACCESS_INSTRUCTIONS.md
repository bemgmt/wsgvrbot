# Human Agent Login - Access Instructions

This document provides step-by-step instructions for accessing the human agent backend interface of the WSGVR chatbot.

## Prerequisites

1. **Node.js and npm installed** - Ensure you have Node.js (v18 or higher) and npm installed on your system
2. **Project dependencies installed** - Run `npm install` in the project root directory if you haven't already
3. **Development server running** - The Next.js development server must be running

## Step-by-Step Access Instructions

### Step 1: Start the Development Server

1. Open a terminal/command prompt
2. Navigate to the project root directory (`e:\WSGVR\chatbot\wsgvrbot`)
3. Run the development server:
   ```bash
   npm run dev
   ```
   Or alternatively:
   ```bash
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Wait for the server to start. You should see output indicating the server is running, typically:
   ```
   ▲ Next.js 16.x.x
   - Local:        http://localhost:3000
   ```

### Step 2: Access the Employee Chat Dashboard

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Navigate to the following URL:
   ```
   http://localhost:3000/employee/chat
   ```
   **Note:** If the server is running on a different port, replace `3000` with the actual port number shown in the terminal.

### Step 3: Enter Your Name

1. When you first access the page, a prompt dialog will appear asking for your name
2. Enter your name (e.g., "John Smith" or "Jane Doe")
3. Click "OK" or press Enter
4. Your name will be saved in the browser's localStorage and will be remembered for future visits

### Step 4: Understanding the Dashboard

The Employee Chat Dashboard consists of three main sections:

#### A. Chat Sessions Panel (Left Side)
- **Live Chats Tab**: Shows pending and active live chat sessions
  - **Pending Chats**: New chat requests waiting to be accepted (yellow "New" badge)
  - **Active Chats**: Chats you're currently handling (green "Active" badge)
- **AI Chats Tab**: Shows all active AI conversations that can be taken over
  - Displays AI conversations with a purple "AI" badge
  - Each AI chat has a "Take Over" button to convert it to a live chat

#### B. Chat Window (Right Side)
- Displays the selected chat conversation
- Shows message history with timestamps
- Message input field at the bottom for sending responses
- Chat header shows:
  - Chat ID (last 8 characters)
  - Chat mode (AI or Live)
  - Status (pending, active, or closed)

#### C. Top Header
- Shows "Employee Chat Dashboard" title
- Displays your logged-in name

## How to Use the Dashboard

### Accepting a Pending Chat

1. In the "Live Chats" tab, find a chat with a yellow "New" badge
2. Click on the chat card or click the "Accept Chat" button
3. The chat will move to "Active" status and appear in the chat window
4. You can now start responding to the user

### Taking Over an AI Chat

1. Switch to the "AI Chats" tab
2. Browse the list of active AI conversations
3. Click on an AI chat to view the conversation history
4. Click the "Take Over" button on the chat card
5. The chat will be converted to live mode and you'll be assigned as the agent
6. The tab will automatically switch to "Live Chats" and the chat will appear in your active chats

### Sending Messages

1. Select an active chat from the list
2. Type your message in the input field at the bottom of the chat window
3. Press Enter or click the Send button (paper plane icon)
4. Your message will appear in the chat with your name displayed

### Closing a Chat

1. With an active chat selected, click the "Close Chat" button in the chat header
2. The chat status will change to "closed" and it will be removed from your active chats list

## Features

- **Auto-refresh**: The chat list automatically refreshes every 2 seconds to show new pending chats
- **Real-time updates**: Messages are polled every 1.5 seconds to show new messages from users
- **Persistent login**: Your employee ID and name are saved in browser localStorage
- **Multiple chat management**: You can view and manage multiple chat sessions
- **AI chat monitoring**: Monitor and take over AI conversations when needed

## Troubleshooting

### Server Not Starting
- Check that port 3000 is not already in use
- Verify Node.js and npm are properly installed
- Ensure all dependencies are installed (`npm install`)

### Cannot Access the Page
- Verify the server is running and check the correct port number
- Try accessing `http://localhost:3000` first to ensure the server is working
- Check browser console for any errors

### Name Prompt Not Appearing
- Clear your browser's localStorage and refresh the page
- Open browser developer tools (F12) and check the Console tab for errors

### Chats Not Appearing
- Ensure there are active chat sessions from users
- Check the browser console for API errors
- Verify the backend API endpoints are working correctly

## Production Access

For production deployments:

1. The URL will be your production domain followed by `/employee/chat`
   - Example: `https://yourdomain.com/employee/chat`
2. Ensure the production server is running (`npm run build` then `npm start`)
3. The same login process applies - you'll be prompted for your name on first visit

## Security Notes

⚠️ **Important**: The current implementation uses browser localStorage for employee identification and does not include authentication. For production use, consider implementing:
- User authentication (login credentials)
- Session management
- Role-based access control
- Secure employee identification

## Additional Information

- **Employee ID**: Automatically generated on first visit (format: `emp_[timestamp]_[random]`)
- **Employee Name**: Stored in localStorage, can be changed by clearing localStorage
- **Chat Storage**: Chats are stored in memory (using ChatStore) and will be lost on server restart

---

**Last Updated**: Based on codebase analysis
**Contact**: For technical support, refer to the project documentation or development team
