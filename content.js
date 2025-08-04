// F1-F12 Key Blocker Content Script
// This script runs on all pages and blocks default F1-F12 behaviors

class F1F12KeyBlocker {
  constructor() {
    this.isEnabled = true;
    this.functionKeys = new Set([
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
      'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ]);
    
    this.blockedKeyCodes = new Set([
      112, 113, 114, 115, 116, 117,  // F1-F6
      118, 119, 120, 121, 122, 123   // F7-F12
    ]);
    
    this.init();
  }

  async init() {
    // Load saved settings
    await this.loadSettings();
    
    // Add event listeners
    this.addEventListeners();
    
    // Listen for settings changes from popup
    this.setupMessageListener();
    
    console.log('F1-F12 Key Blocker initialized:', this.isEnabled ? 'ENABLED' : 'DISABLED');
  }

  async loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(['keyBlockerEnabled']);
        this.isEnabled = result.keyBlockerEnabled !== false; // Default to true
      }
    } catch (error) {
      console.warn('Could not load settings, using defaults:', error);
      this.isEnabled = true;
    }
  }

  addEventListeners() {
    // Use capture phase to intercept events before they reach other handlers
    document.addEventListener('keydown', this.handleKeyDown.bind(this), {
      capture: true,
      passive: false
    });

    document.addEventListener('keypress', this.handleKeyPress.bind(this), {
      capture: true,
      passive: false
    });

    document.addEventListener('keyup', this.handleKeyUp.bind(this), {
      capture: true,
      passive: false
    });

    // Also listen on window to catch events that might bubble up
    window.addEventListener('keydown', this.handleKeyDown.bind(this), {
      capture: true,
      passive: false
    });
  }

  handleKeyDown(event) {
    if (!this.isEnabled) return;

    // Check if it's a function key
    if (this.isFunctionKey(event)) {
      this.blockKeyEvent(event, 'keydown');
      return false;
    }
  }

  handleKeyPress(event) {
    if (!this.isEnabled) return;

    if (this.isFunctionKey(event)) {
      this.blockKeyEvent(event, 'keypress');
      return false;
    }
  }

  handleKeyUp(event) {
    if (!this.isEnabled) return;

    if (this.isFunctionKey(event)) {
      this.blockKeyEvent(event, 'keyup');
      return false;
    }
  }

  isFunctionKey(event) {
    // Check by key property (modern browsers)
    if (event.key && this.functionKeys.has(event.key)) {
      return true;
    }

    // Check by keyCode (legacy support)
    if (event.keyCode && this.blockedKeyCodes.has(event.keyCode)) {
      return true;
    }

    // Check by which property (alternative legacy support)
    if (event.which && this.blockedKeyCodes.has(event.which)) {
      return true;
    }

    return false;
  }

  blockKeyEvent(event, type) {
    // Prevent all default behaviors
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Log blocked event for debugging (can be removed in production)
    if (this.shouldLog()) {
      console.log(`Blocked ${type} event:`, {
        key: event.key,
        keyCode: event.keyCode,
        which: event.which,
        target: event.target.tagName,
        url: window.location.href
      });
    }

    return false;
  }

  shouldLog() {
    // Only log occasionally to avoid spam
    return Math.random() < 0.1; // 10% of the time
  }

  setupMessageListener() {
    // Listen for messages from popup/background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TOGGLE_KEY_BLOCKER') {
          this.isEnabled = message.enabled;
          console.log('Key blocker toggled:', this.isEnabled ? 'ENABLED' : 'DISABLED');
          sendResponse({ success: true, enabled: this.isEnabled });
        } else if (message.type === 'GET_STATUS') {
          sendResponse({ enabled: this.isEnabled });
        }
      });
    }
  }

  // Method to manually toggle (for testing)
  toggle() {
    this.isEnabled = !this.isEnabled;
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ keyBlockerEnabled: this.isEnabled });
    }
    console.log('Key blocker manually toggled:', this.isEnabled ? 'ENABLED' : 'DISABLED');
    return this.isEnabled;
  }
}

// Initialize the key blocker
const keyBlocker = new F1F12KeyBlocker();

// Make it globally accessible for debugging
window.f1f12KeyBlocker = keyBlocker;