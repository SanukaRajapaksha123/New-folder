// F1-F12 Key Blocker Background Script
// Manages extension state and handles communication between popup and content scripts

class KeyBlockerBackground {
  constructor() {
    this.init();
  }

  async init() {
    // Set default settings on installation
    chrome.runtime.onInstalled.addListener(this.onInstalled.bind(this));
    
    // Handle messages from popup and content scripts
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
    
    // Update badge based on current state
    this.updateBadge();
    
    console.log('F1-F12 Key Blocker background script initialized');
  }

  async onInstalled(details) {
    if (details.reason === 'install') {
      // Set default settings
      await chrome.storage.sync.set({
        keyBlockerEnabled: true,
        installDate: Date.now(),
        version: chrome.runtime.getManifest().version
      });
      
      console.log('Extension installed with default settings');
      this.updateBadge();
      
      // Show welcome notification
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      console.log('Extension updated to version:', chrome.runtime.getManifest().version);
      this.updateBadge();
    }
  }

  async onMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'TOGGLE_KEY_BLOCKER':
          await this.toggleKeyBlocker(message.enabled);
          sendResponse({ success: true, enabled: message.enabled });
          break;
          
        case 'GET_STATUS':
          const status = await this.getStatus();
          sendResponse(status);
          break;
          
        case 'UPDATE_SETTINGS':
          await this.updateSettings(message.settings);
          sendResponse({ success: true });
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
    
    return true; // Keep the message channel open for async response
  }

  async toggleKeyBlocker(enabled) {
    // Save to storage
    await chrome.storage.sync.set({ keyBlockerEnabled: enabled });
    
    // Update badge
    this.updateBadge();
    
    // Notify all content scripts
    await this.broadcastToContentScripts({
      type: 'TOGGLE_KEY_BLOCKER',
      enabled: enabled
    });
    
    console.log('Key blocker toggled:', enabled ? 'ENABLED' : 'DISABLED');
  }

  async getStatus() {
    try {
      const result = await chrome.storage.sync.get(['keyBlockerEnabled']);
      return {
        enabled: result.keyBlockerEnabled !== false, // Default to true
        version: chrome.runtime.getManifest().version
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return { enabled: true, version: '1.0.0' };
    }
  }

  async updateSettings(settings) {
    await chrome.storage.sync.set(settings);
    
    // If key blocker state changed, notify content scripts
    if ('keyBlockerEnabled' in settings) {
      await this.broadcastToContentScripts({
        type: 'TOGGLE_KEY_BLOCKER',
        enabled: settings.keyBlockerEnabled
      });
      this.updateBadge();
    }
  }

  async broadcastToContentScripts(message) {
    try {
      const tabs = await chrome.tabs.query({});
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, message);
        } catch (error) {
          // Ignore errors for tabs that don't have content script
          // (like chrome:// pages or extension pages)
        }
      }
    } catch (error) {
      console.error('Error broadcasting to content scripts:', error);
    }
  }

  async updateBadge() {
    try {
      const status = await this.getStatus();
      
      // Set badge text and color based on enabled status
      await chrome.action.setBadgeText({
        text: status.enabled ? 'ON' : 'OFF'
      });
      
      await chrome.action.setBadgeBackgroundColor({
        color: status.enabled ? '#4CAF50' : '#F44336' // Green for ON, Red for OFF
      });
      
      // Update tooltip
      await chrome.action.setTitle({
        title: status.enabled 
          ? 'F1-F12 Key Blocker (ENABLED)' 
          : 'F1-F12 Key Blocker (DISABLED)'
      });
      
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  }

  showWelcomeNotification() {
    // Could add a notification here, but keeping it simple for now
    console.log('Welcome to F1-F12 Key Blocker! Function keys are now blocked by default.');
  }
}

// Initialize background script
new KeyBlockerBackground();