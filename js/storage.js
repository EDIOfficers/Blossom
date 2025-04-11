/**
 * storage.js - LocalStorage management utilities for Miscarriage Support Web Application
 */

const StorageKeys = {
  USERS: 'msc_users',
  CURRENT_USER: 'msc_current_user',
  QUESTIONNAIRE: 'msc_questionnaire_',
  CHAT_HISTORY: 'msc_chat_',
  MOOD_TRACKER: 'msc_mood_',
  DAILY_LOGS: 'msc_logs_'
};

/**
 * Storage utility object for managing application data in localStorage
 */
const Storage = {
  /**
   * Initialize the application storage with default data
   */
  init() {
    // Check if users already exist in storage
    if (!this.getUsers()) {
      // Create the admin user
      const adminUser = {
        username: 'admin',
        password: '123456',
        isAdmin: true,
        profile: {
          name: 'Admin',
          email: 'admin@example.com'
        },
        created: new Date().toISOString()
      };
      
      // Initialize users array with admin
      this.setUsers([adminUser]);
      console.log('Storage initialized with admin user');
    }
  },
  
  /**
   * Get all users from storage
   * @returns {Array} Array of user objects
   */
  getUsers() {
    const users = localStorage.getItem(StorageKeys.USERS);
    return users ? JSON.parse(users) : null;
  },
  
  /**
   * Set users in storage
   * @param {Array} users - Array of user objects
   */
  setUsers(users) {
    localStorage.setItem(StorageKeys.USERS, JSON.stringify(users));
  },
  
  /**
   * Get user by username
   * @param {string} username - Username to search for
   * @returns {Object|null} User object if found, null otherwise
   */
  getUserByUsername(username) {
    const users = this.getUsers();
    if (!users) return null;
    
    return users.find(user => user.username === username) || null;
  },
  
  /**
   * Add a new user
   * @param {Object} user - User object to add
   * @returns {boolean} Success status
   */
  addUser(user) {
    const users = this.getUsers() || [];
    
    // Check if username already exists
    if (users.some(u => u.username === user.username)) {
      return false;
    }
    
    // Add created timestamp
    user.created = new Date().toISOString();
    
    // Add to users array
    users.push(user);
    this.setUsers(users);
    return true;
  },
  
  /**
   * Update an existing user
   * @param {string} username - Username of user to update
   * @param {Object} updates - Object with properties to update
   * @returns {boolean} Success status
   */
  updateUser(username, updates) {
    const users = this.getUsers();
    if (!users) return false;
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) return false;
    
    // Update the user with new properties
    users[userIndex] = { ...users[userIndex], ...updates, updated: new Date().toISOString() };
    
    this.setUsers(users);
    return true;
  },
  
  /**
   * Set current logged in user
   * @param {Object} user - User object without sensitive data
   */
  setCurrentUser(user) {
    const sessionData = {
      username: user.username,
      isAdmin: user.isAdmin || false,
      lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem(StorageKeys.CURRENT_USER, JSON.stringify(sessionData));
  },
  
  /**
   * Get current logged in user
   * @returns {Object|null} Current user session or null if not logged in
   */
  getCurrentUser() {
    const user = localStorage.getItem(StorageKeys.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  
  /**
   * Clear current user session (logout)
   */
  clearCurrentUser() {
    localStorage.removeItem(StorageKeys.CURRENT_USER);
  },
  
  /**
   * Check if a user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },
  
  /**
   * Save questionnaire responses for a user
   * @param {string} username - Username
   * @param {Array} responses - Array of question/answer objects
   */
  saveQuestionnaireResponses(username, responses) {
    const data = {
      username,
      completed: true,
      responses,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(StorageKeys.QUESTIONNAIRE + username, JSON.stringify(data));
  },
  
  /**
   * Get questionnaire responses for a user
   * @param {string} username - Username
   * @returns {Object|null} Questionnaire data or null if not found
   */
  getQuestionnaireResponses(username) {
    const data = localStorage.getItem(StorageKeys.QUESTIONNAIRE + username);
    return data ? JSON.parse(data) : null;
  },
  
  /**
   * Check if a user has completed the questionnaire
   * @param {string} username - Username
   * @returns {boolean} Completion status
   */
  hasCompletedQuestionnaire(username) {
    const data = this.getQuestionnaireResponses(username);
    return data ? data.completed : false;
  },
  
  /**
   * Save a chat message
   * @param {string} username - Username
   * @param {string} conversationId - Conversation ID
   * @param {Object} message - Message object
   */
  saveChatMessage(username, conversationId, message) {
    let chatHistory = this.getChatHistory(username);
    
    if (!chatHistory) {
      chatHistory = {
        username,
        conversations: []
      };
    }
    
    // Find conversation or create a new one
    let conversation = chatHistory.conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      conversation = {
        id: conversationId,
        timestamp: new Date().toISOString(),
        messages: []
      };
      chatHistory.conversations.push(conversation);
    }
    
    // Add message with timestamp
    message.timestamp = message.timestamp || new Date().toISOString();
    conversation.messages.push(message);
    
    localStorage.setItem(StorageKeys.CHAT_HISTORY + username, JSON.stringify(chatHistory));
  },
  
  /**
   * Get chat history for a user
   * @param {string} username - Username
   * @returns {Object|null} Chat history or null if not found
   */
  getChatHistory(username) {
    const data = localStorage.getItem(StorageKeys.CHAT_HISTORY + username);
    return data ? JSON.parse(data) : null;
  },
  
  /**
   * Get a specific conversation by ID
   * @param {string} username - Username
   * @param {string} conversationId - Conversation ID
   * @returns {Object|null} Conversation or null if not found
   */
  getConversation(username, conversationId) {
    const chatHistory = this.getChatHistory(username);
    if (!chatHistory) return null;
    
    return chatHistory.conversations.find(c => c.id === conversationId) || null;
  },
  
  /**
   * Create a new conversation
   * @param {string} username - Username
   * @returns {string} New conversation ID
   */
  createNewConversation(username) {
    const chatHistory = this.getChatHistory(username) || {
      username,
      conversations: []
    };
    
    // Generate unique ID
    const conversationId = 'conv_' + Date.now();
    
    // Create new conversation
    const newConversation = {
      id: conversationId,
      timestamp: new Date().toISOString(),
      messages: []
    };
    
    chatHistory.conversations.push(newConversation);
    localStorage.setItem(StorageKeys.CHAT_HISTORY + username, JSON.stringify(chatHistory));
    
    return conversationId;
  },
  
  /**
   * Save a mood tracker entry
   * @param {string} username - Username
   * @param {Object} entry - Mood entry object
   */
  saveMoodEntry(username, entry) {
    let moodData = this.getMoodData(username);
    
    if (!moodData) {
      moodData = {
        username,
        entries: []
      };
    }
    
    // Add entry
    moodData.entries.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(StorageKeys.MOOD_TRACKER + username, JSON.stringify(moodData));
  },
  
  /**
   * Get mood data for a user
   * @param {string} username - Username
   * @returns {Object|null} Mood data or null if not found
   */
  getMoodData(username) {
    const data = localStorage.getItem(StorageKeys.MOOD_TRACKER + username);
    return data ? JSON.parse(data) : null;
  },
  
  /**
   * Save a daily log entry
   * @param {string} username - Username
   * @param {Object} entry - Log entry object
   */
  saveLogEntry(username, entry) {
    let dailyLogs = this.getDailyLogs(username);
    
    if (!dailyLogs) {
      dailyLogs = {
        username,
        entries: []
      };
    }
    
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = 'log_' + Date.now();
    }
    
    // Add timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = new Date().toISOString();
    }
    
    // Find if entry with same date exists
    const existingEntryIndex = dailyLogs.entries.findIndex(e => e.id === entry.id);
    
    if (existingEntryIndex !== -1) {
      // Update existing entry
      dailyLogs.entries[existingEntryIndex] = entry;
    } else {
      // Add as new entry
      dailyLogs.entries.push(entry);
    }
    
    localStorage.setItem(StorageKeys.DAILY_LOGS + username, JSON.stringify(dailyLogs));
    
    return entry.id;
  },
  
  /**
   * Get daily logs for a user
   * @param {string} username - Username
   * @returns {Object|null} Daily logs or null if not found
   */
  getDailyLogs(username) {
    const data = localStorage.getItem(StorageKeys.DAILY_LOGS + username);
    return data ? JSON.parse(data) : null;
  }
};

// Initialize storage when script loads
document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
});