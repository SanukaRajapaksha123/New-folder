# F1-F12 Key Blocker Browser Extension

A Chrome/Edge browser extension that blocks the default browser behaviors for F1-F12 function keys, allowing you to use them for custom shortcuts in other applications.

## Features

- ✨ Blocks all F1-F12 function key default behaviors
- 🔄 Easy toggle on/off functionality
- 🎯 Works on all websites and pages
- 💾 Remembers your preference across browser sessions
- 🎨 Clean, modern popup interface
- ⚡ Lightweight and fast

## Installation

### Load as Unpacked Extension (Development)

1. **Open Chrome/Edge Extension Manager**
   - Chrome: Go to `chrome://extensions/`
   - Edge: Go to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing these extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in the browser toolbar
   - Find "F1-F12 Key Blocker" and click the pin icon

### Icon Setup (Required)

The extension requires icon files. Convert the provided `icons/icon.svg` to PNG format:

**Required icon sizes:**
- `icons/icon16.png` (16x16)
- `icons/icon32.png` (32x32) 
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

**Quick conversion options:**
1. Use online converters like [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Use image editing software (Photoshop, GIMP, etc.)
3. Use command line tools like ImageMagick: `convert icon.svg -resize 16x16 icon16.png`

## Usage

### Basic Operation

1. **Enable/Disable**: Click the extension icon and toggle the switch
2. **Status Check**: The badge shows "ON" (green) or "OFF" (red)
3. **Test**: Click "Test on this page" to verify functionality

### What Gets Blocked

When enabled, the extension prevents these default browser behaviors:

| Key | Default Browser Behavior |
|-----|--------------------------|
| F1  | Open Help |
| F2  | Rename (in some contexts) |
| F3  | Find in page |
| F4  | Address bar focus |
| F5  | Refresh page |
| F6  | Focus address bar |
| F7  | Caret browsing |
| F8  | (Various) |
| F9  | (Various) |
| F10 | Menu bar focus |
| F11 | Fullscreen toggle |
| F12 | Developer tools |

## Testing the Extension

### Manual Testing

1. **Load the extension** and ensure it's enabled
2. **Go to any website** (e.g., google.com)
3. **Press function keys**:
   - F1: Should NOT open help
   - F3: Should NOT open find dialog
   - F5: Should NOT refresh page
   - F11: Should NOT toggle fullscreen
   - F12: Should NOT open dev tools

### Verification Steps

- [ ] Extension badge shows "ON" when enabled
- [ ] Function keys don't trigger browser actions
- [ ] Toggle switch works in popup
- [ ] Settings persist after browser restart
- [ ] Works across different websites
- [ ] Works in incognito mode (if enabled)

## Technical Details

### Architecture

- **Manifest V3** for modern browser compatibility
- **Content Script**: Captures key events on all pages
- **Background Script**: Manages extension state
- **Popup Interface**: User controls and status
- **Chrome Storage**: Persists user preferences

### Key Files

```
├── manifest.json          # Extension configuration
├── content.js             # Key event blocking logic
├── background.js          # State management
├── popup.html            # User interface
├── popup.css             # Styling
├── popup.js              # UI logic
└── icons/                # Extension icons
    ├── icon.svg          # Source SVG icon
    ├── icon16.png        # 16x16 icon
    ├── icon32.png        # 32x32 icon
    ├── icon48.png        # 48x48 icon
    └── icon128.png       # 128x128 icon
```

### Browser Compatibility

- ✅ Chrome 88+
- ✅ Microsoft Edge 88+
- ✅ Other Chromium-based browsers

## Troubleshooting

### Function Keys Still Work

1. Check if extension is enabled (badge should show "ON")
2. Refresh the page you're testing on
3. Check if extension has permission for the site
4. Try disabling other extensions temporarily

### Extension Not Loading

1. Ensure all required files are present
2. Create the PNG icon files from the SVG
3. Check browser console for errors
4. Verify manifest.json syntax

### Settings Not Saving

1. Check if extension has storage permissions
2. Try toggling the setting again
3. Restart the browser

## Development

### Building

No build process required - load directly as unpacked extension.

### Debugging

1. **Content Script**: Open DevTools on any page, check Console
2. **Background Script**: Go to `chrome://extensions/`, click "Inspect views: background page"
3. **Popup**: Right-click extension icon, select "Inspect popup"

### Key Components

- `F1F12KeyBlocker` class in content.js handles key blocking
- `KeyBlockerBackground` class manages extension lifecycle
- `KeyBlockerPopup` class handles UI interactions

## License

This extension is provided as-is for educational and personal use.

## Version History

### v1.0.0
- Initial release
- Block F1-F12 function keys
- Toggle on/off functionality
- Modern Manifest V3 implementation