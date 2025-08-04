// F1-F12 Key Blocker Popup Script
// Handles UI interactions and communication with background script

class KeyBlockerPopup {
  constructor() {
    this.elements = {};
    this.currentStatus = { enabled: true, version: '1.0.0' };
    this.init();
  }

  async init() {
    this.initializeElements();
    await this.loadCurrentStatus();
    this.attachEventListeners();
    this.updateUI();
    
    console.log('Popup initialized');
  }

  initializeElements() {
    this.elements = {
      enableToggle: document.getElementById('enableToggle'),
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      testButton: document.getElementById('testButton'),
      version: document.getElementById('version')
    };

    // Verify all elements exist
    for (const [name, element] of Object.entries(this.elements)) {
      if (!element) {
        console.error(`Element not found: ${name}`);
      }
    }
  }

  async loadCurrentStatus() {
    try {
      const response = await this.sendMessage({ type: 'GET_STATUS' });
      
      if (response && typeof response.enabled !== 'undefined') {
        this.currentStatus = response;
      } else {
        console.warn('Invalid response from background script:', response);
        // Use defaults
        this.currentStatus = { enabled: true, version: '1.0.0' };
      }
    } catch (error) {
      console.error('Error loading status:', error);
      this.currentStatus = { enabled: true, version: '1.0.0' };
    }
  }

  attachEventListeners() {
    // Toggle switch
    if (this.elements.enableToggle) {
      this.elements.enableToggle.addEventListener('change', this.handleToggleChange.bind(this));
    }

    // Test button
    if (this.elements.testButton) {
      this.elements.testButton.addEventListener('click', this.handleTestClick.bind(this));
    }

    // Keyboard shortcuts in popup
    document.addEventListener('keydown', this.handlePopupKeyDown.bind(this));
  }

  async handleToggleChange(event) {
    const enabled = event.target.checked;
    
    try {
      // Show loading state
      this.setLoadingState(true);
      
      // Send message to background script
      const response = await this.sendMessage({
        type: 'TOGGLE_KEY_BLOCKER',
        enabled: enabled
      });

      if (response && response.success) {
        this.currentStatus.enabled = enabled;
        this.updateUI();
        this.showFeedback(enabled ? 'Function keys blocked' : 'Function keys unblocked');
      } else {
        throw new Error('Failed to toggle key blocker');
      }
    } catch (error) {
      console.error('Error toggling key blocker:', error);
      // Revert toggle state
      event.target.checked = !enabled;
      this.showError('Failed to update settings');
    } finally {
      this.setLoadingState(false);
    }
  }

  async handleTestClick() {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        // Show instruction
        this.showFeedback('Try pressing F1-F12 keys on the current page');
        
        // Focus the current tab (close popup)
        await chrome.tabs.update(tab.id, { active: true });
        window.close();
      } else {
        throw new Error('No active tab found');
      }
    } catch (error) {
      console.error('Error during test:', error);
      this.showError('Could not activate test mode');
    }
  }

  handlePopupKeyDown(event) {
    // Allow function keys in popup for demonstration
    if (event.key && event.key.startsWith('F') && event.key.length <= 3) {
      this.showFeedback(`${event.key} pressed in popup (not blocked here)`);
    }
  }

  updateUI() {
    const { enabled } = this.currentStatus;

    // Update toggle
    if (this.elements.enableToggle) {
      this.elements.enableToggle.checked = enabled;
    }

    // Update status indicator
    if (this.elements.statusDot) {
      this.elements.statusDot.className = `status-dot ${enabled ? 'enabled' : 'disabled'}`;
    }

    // Update status text
    if (this.elements.statusText) {
      this.elements.statusText.textContent = enabled 
        ? 'Function keys are blocked' 
        : 'Function keys are active';
    }

    // Update version
    if (this.elements.version && this.currentStatus.version) {
      this.elements.version.textContent = `v${this.currentStatus.version}`;
    }

    // Update test button
    if (this.elements.testButton) {
      this.elements.testButton.textContent = enabled ? 'Test on this page' : 'Enable first to test';
      this.elements.testButton.disabled = !enabled;
    }
  }

  setLoadingState(loading) {
    if (this.elements.enableToggle) {
      this.elements.enableToggle.disabled = loading;
    }
    
    if (this.elements.testButton) {
      this.elements.testButton.disabled = loading || !this.currentStatus.enabled;
      this.elements.testButton.textContent = loading ? 'Updating...' : 
        (this.currentStatus.enabled ? 'Test on this page' : 'Enable first to test');
    }
  }

  showFeedback(message, type = 'info') {
    // Create a temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 1000;
      animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
          if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
          }
        }, 300);
      }
    }, 3000);
  }

  showError(message) {
    this.showFeedback(message, 'error');
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Add CSS animations for feedback
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new KeyBlockerPopup());
} else {
  new KeyBlockerPopup();
}