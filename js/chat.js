/**
 * chat.js - Chatbot logic for Blossom Miscarriage Support Application
 */

class ChatInterface {
  constructor() {
    // Elements
    this.chatWindow = document.getElementById('chat-window');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
    this.typingIndicator = document.getElementById('typing-indicator');
    
    // Current user and conversation
    this.currentUser = Storage.getCurrentUser();
    this.username = this.currentUser?.username;
    this.currentConversationId = null;
    
    // Bind methods
    this.initializeChat = this.initializeChat.bind(this);
    this.addMessageToChat = this.addMessageToChat.bind(this);
    this.showTypingIndicator = this.showTypingIndicator.bind(this);
    this.hideTypingIndicator = this.hideTypingIndicator.bind(this);
    this.getBotResponse = this.getBotResponse.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    
    // Bot response patterns
    this.botResponses = [
      {
        triggers: ['hello', 'hi', 'hey'],
        responses: [
          "Hi there. How are you feeling today?",
          "Hello. I'm here to listen. How are you doing?"
        ]
      },
      {
        triggers: ['sad', 'upset', 'unhappy', 'down', 'depressed', 'low'],
        responses: [
          "I'm sorry to hear you're feeling this way. It's completely understandable to feel sad after what you've been through.",
          "It's okay to feel sad. Your feelings are valid and important. Would you like to talk more about what's making you feel this way?",
          "Grief and sadness can come in waves. I'm here to listen whenever you need someone."
        ]
      },
      {
        triggers: ['angry', 'mad', 'frustrated', 'unfair'],
        responses: [
          "It's normal to feel angry or frustrated. These are natural responses to loss and you shouldn't feel guilty about them.",
          "Anger is a valid emotion in your healing journey. Would you like to explore ways to express this anger in healthy ways?",
          "I understand you're feeling frustrated. It's unfair what you've experienced, and it's okay to acknowledge that."
        ]
      },
      {
        triggers: ['scared', 'afraid', 'anxious', 'worried', 'fear'],
        responses: [
          "It's understandable to feel anxious or worried. Would it help to talk about your specific concerns?",
          "Fear is a common response after a miscarriage. Many people worry about the future. Is there something specific you're concerned about?",
          "Anxiety can be overwhelming. Remember to take things one day at a time. Would you like to try a simple breathing exercise together?"
        ]
      },
      {
        triggers: ['lonely', 'alone', 'isolated', 'no one understands'],
        responses: [
          "It can feel very isolating, but you're not alone in this experience. Many people feel the same way you do.",
          "I'm sorry you're feeling lonely. Would it help to connect with others who have had similar experiences?",
          "It's difficult when you feel like no one understands. I'm here to listen without judgment."
        ]
      },
      {
        triggers: ['hopeful', 'better', 'improving', 'positive'],
        responses: [
          "I'm glad you're feeling more hopeful. Small steps forward are worth celebrating.",
          "That's wonderful to hear. Healing isn't always linear, but these moments of positivity are important.",
          "I'm happy you're feeling better today. What has been helping you feel this way?"
        ]
      },
      {
        triggers: ['tired', 'exhausted', 'fatigued', 'sleep'],
        responses: [
          "Physical and emotional exhaustion are common during this time. Are you able to get enough rest?",
          "It can be difficult to sleep when you're processing grief. Would you like some gentle suggestions that might help?",
          "Feeling tired is natural as your body and mind are working hard to heal. Be gentle with yourself."
        ]
      },
      {
        triggers: ['guilty', 'blame', 'my fault', 'did something wrong'],
        responses: [
          "Please know that miscarriage is almost never caused by anything the mother did or didn't do. This was not your fault.",
          "Many people experience feelings of guilt after miscarriage, but it's important to know that you did nothing wrong.",
          "Self-blame is common, but miscarriage is almost always due to factors completely beyond your control."
        ]
      },
      {
        triggers: ['future', 'try again', 'pregnancy', 'baby'],
        responses: [
          "Thinking about the future can bring up many emotions. It's okay to take time before making any decisions.",
          "It's normal to have questions and concerns about future pregnancies. Have you spoken with your healthcare provider about this?",
          "Everyone's timeline for healing and moving forward is different. There's no rush to make any decisions right now."
        ]
      },
      {
        triggers: ['help', 'resource', 'support', 'therapy', 'counseling'],
        responses: [
          "There are many resources available to support you. Would you like to know about some support groups or counseling options?",
          "Professional support can be very helpful. Would you like me to suggest some resources?",
          "Talking with a counselor who specializes in pregnancy loss can be beneficial. Would you like information about finding one?"
        ]
      },
      {
        triggers: ['partner', 'husband', 'wife', 'spouse', 'relationship'],
        responses: [
          "Partners often grieve differently, which can sometimes create distance. Have you been able to talk with each other about how you're both feeling?",
          "It can be challenging when you and your partner process grief in different ways. Would it help to discuss some communication strategies?",
          "Your partner may also be grieving, though perhaps in a different way. Sometimes couples counseling can help navigate this together."
        ]
      },
      {
        triggers: ['physical', 'pain', 'bleeding', 'cramps', 'symptoms'],
        responses: [
          "If you're experiencing concerning physical symptoms, it's important to contact your healthcare provider right away.",
          "Physical recovery is an important part of healing. Have you been able to follow up with your doctor?",
          "Physical discomfort can add to the emotional difficulty. Are you managing okay with pain relief methods suggested by your doctor?"
        ]
      }
    ];
    
    // Default responses when no keyword match is found
    this.defaultResponses = [
      "I'm here to listen. Can you tell me more about how you're feeling?",
      "Thank you for sharing that with me. Would you like to talk more about it?",
      "I understand this is a difficult time. What would be most helpful for you right now?",
      "I'm here to support you through this journey. Is there something specific you'd like to discuss?",
      "Your feelings are valid and important. Would you like to explore this further?"
    ];
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the chat interface
   */
  init() {
    // Authentication check
    if (!Storage.isAuthenticated()) {
      window.location.href = 'auth.html';
      return;
    }
    
    // Auto resize textarea
    this.chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Handle send button click
    this.sendButton.addEventListener('click', () => {
      this.sendMessage(this.chatInput.value);
    });
    
    // Handle enter key press
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(this.chatInput.value);
      }
    });
    
    // Handle emoji button clicks
    document.querySelectorAll('.emoji-button').forEach(button => {
      button.addEventListener('click', () => {
        this.chatInput.value += button.textContent;
        this.chatInput.focus();
      });
    });
    
    // Load existing conversation or initialize a new one
    this.loadConversation();
  }
  
  /**
   * Load existing conversation or create a new one
   */
  loadConversation() {
    const chatHistory = Storage.getChatHistory(this.username);
    
    if (chatHistory && chatHistory.conversations.length > 0) {
      // Get the most recent conversation
      const latestConversation = chatHistory.conversations.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      
      this.currentConversationId = latestConversation.id;
      
      // Clear default welcome message
      this.chatWindow.innerHTML = '';
      
      // Add date separator
      const dateSeparator = document.createElement('div');
      dateSeparator.className = 'date-separator';
      dateSeparator.textContent = 'Today';
      this.chatWindow.appendChild(dateSeparator);
      
      // Load messages
      latestConversation.messages.forEach(message => {
        this.addMessageToChat(message.sender, message.content, message.timestamp);
      });
    } else {
      // Initialize new chat
      this.initializeChat();
    }
  }
  
  /**
   * Initialize a new chat conversation
   */
  initializeChat() {
    // Create a new conversation
    this.currentConversationId = Storage.createNewConversation(this.username);
    
    // Add welcome message to storage
    const welcomeMessage = {
      sender: 'bot',
      content: "Hello there! I'm your Blossom companion. I'm here to listen and support you through your healing journey. How are you feeling today?",
      timestamp: new Date().toISOString()
    };
    
    Storage.saveChatMessage(this.username, this.currentConversationId, welcomeMessage);
    
    // Clear default welcome message and add dynamic one
    this.chatWindow.innerHTML = '';
    
    // Add date separator
    const dateSeparator = document.createElement('div');
    dateSeparator.className = 'date-separator';
    dateSeparator.textContent = 'Today';
    this.chatWindow.appendChild(dateSeparator);
    
    // Add welcome message
    this.addMessageToChat(welcomeMessage.sender, welcomeMessage.content, welcomeMessage.timestamp);
  }
  
  /**
   * Add a message to the chat window
   * @param {string} sender - 'user' or 'bot'
   * @param {string} content - Message content
   * @param {string} timestamp - ISO timestamp
   */
  addMessageToChat(sender, content, timestamp) {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${sender}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    messageElement.appendChild(messageContent);
    
    // Format timestamp
    const messageTime = new Date(timestamp);
    const formattedTime = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const timestampElement = document.createElement('div');
    timestampElement.className = 'message-timestamp';
    timestampElement.textContent = formattedTime;
    messageElement.appendChild(timestampElement);
    
    // Add action buttons if it's a bot message
    if (sender === 'bot') {
      // Simple response suggestions based on message content
      let suggestions = [];
      
      if (content.includes('feeling')) {
        suggestions = ["I'm feeling okay", "I'm struggling today", "I just want to talk"];
      } else if (content.includes('support')) {
        suggestions = ["Tell me more", "What resources are available?", "I need professional help"];
      } else if (content.includes('future') || content.includes('pregnancy')) {
        suggestions = ["I'm afraid to try again", "I need time to heal", "I have questions"];
      } else {
        // Check for more specific contexts
        if (content.includes('anxious') || content.includes('worried')) {
          suggestions = ["Yes, I am worried", "How can I manage anxiety?", "I'm overwhelmed"];
        } else if (content.includes('sleep') || content.includes('tired')) {
          suggestions = ["I can't sleep well", "What might help?", "It's exhausting"];
        } else if (content.includes('talk')) {
          suggestions = ["Yes", "Not right now", "I'm not sure what to say"];
        } else {
          suggestions = ["Yes", "No", "Tell me more"];
        }
      }
      
      if (suggestions.length > 0) {
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        
        suggestions.forEach(suggestion => {
          const button = document.createElement('button');
          button.className = 'action-button';
          button.textContent = suggestion;
          button.addEventListener('click', () => {
            this.sendMessage(suggestion);
          });
          actionButtons.appendChild(button);
        });
        
        messageElement.appendChild(actionButtons);
      }
    }
    
    this.chatWindow.appendChild(messageElement);
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }
  
  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    this.typingIndicator.style.display = 'flex';
    this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
  }
  
  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    this.typingIndicator.style.display = 'none';
  }
  
  /**
   * Get bot response based on user message
   * @param {string} userMessage - User's message
   * @returns {string} Bot's response
   */
  getBotResponse(userMessage) {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Check for keyword matches
    for (const responseSet of this.botResponses) {
      for (const trigger of responseSet.triggers) {
        if (lowercaseMessage.includes(trigger)) {
          // Return random response from matched category
          const randomIndex = Math.floor(Math.random() * responseSet.responses.length);
          return responseSet.responses[randomIndex];
        }
      }
    }
    
    // No keyword match, return default response
    const randomIndex = Math.floor(Math.random() * this.defaultResponses.length);
    return this.defaultResponses[randomIndex];
  }
  
  /**
   * Send a message
   * @param {string} message - Message to send
   */
  sendMessage(message) {
    if (!message.trim()) return;
    
    const timestamp = new Date().toISOString();
    
    // Add user message to UI and storage
    this.addMessageToChat('user', message, timestamp);
    Storage.saveChatMessage(this.username, this.currentConversationId, {
      sender: 'user',
      content: message,
      timestamp
    });
    
    // Clear input
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Simulate bot thinking and typing
    setTimeout(() => {
      this.hideTypingIndicator();
      
      // Generate and add bot response
      const botResponse = this.getBotResponse(message);
      const botTimestamp = new Date().toISOString();
      
      this.addMessageToChat('bot', botResponse, botTimestamp);
      Storage.saveChatMessage(this.username, this.currentConversationId, {
        sender: 'bot',
        content: botResponse,
        timestamp: botTimestamp
      });
      
      // Check for keywords that might suggest the user needs further support
      const lowercaseMessage = message.toLowerCase();
      if (lowercaseMessage.includes('suicide') || 
          lowercaseMessage.includes('kill myself') || 
          lowercaseMessage.includes('don\'t want to live')) {
        
        // Add crisis support message after a short delay
        setTimeout(() => {
          const crisisMessage = "I notice you may be experiencing severe distress. Please remember that immediate support is available. Consider contacting a crisis helpline like the Samaritans (116 123) which is available 24/7, or speak with your healthcare provider. Would you like me to provide more crisis support resources?";
          const crisisTimestamp = new Date().toISOString();
          
          this.addMessageToChat('bot', crisisMessage, crisisTimestamp);
          Storage.saveChatMessage(this.username, this.currentConversationId, {
            sender: 'bot',
            content: crisisMessage,
            timestamp: crisisTimestamp
          });
        }, 1500);
      }
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  }
}

// Initialize the chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChatInterface();
});
