# MicPlus

Control your microphone's state directly from Raycast using NirCmd.

## Features

- **Toggle Microphone:** Quickly switch between mute and unmute states.
- **Mute/Unmute:** Dedicated commands for specific actions.
- **Status Check:** Verify if NirCmd is correctly configured on your system.
- **Custom Configuration:** Use the system's `nircmd` or specify a custom path in preferences.

## Requirements

This extension requires **NirCmd** to be available on your Windows system.

1. **Recommended:** Add `nircmd.exe` to your System PATH variables.
2. **Alternative:** Specify the full path to `nircmd.exe` in the extension preferences.

## Setup

1. Install the extension.
2. If `nircmd` is already in your PATH, it works out of the box.
3. If not, run the **Check NirCmd Status** command or go to **Extension Preferences** to select the executable file.

## License

MIT
