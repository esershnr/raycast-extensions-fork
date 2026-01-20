import {
  Color,
  Icon,
  Image,
  MenuBarExtra as MenuBarExtraOriginal,
  getPreferenceValues,
  openCommandPreferences,
  openExtensionPreferences,
} from "@raycast/api";
import { useEffect, useState } from "react";
import React from "react";
import { toggleSystemAudioInputLevel } from "./utils";
import { AudioInputLevelCache } from "./audio-input-level-cache";

// Define explicit interfaces to fix inference issues
// We use 'Image.ImageLike' for icons to satisfy the linter and strict type safety.
interface CustomMenuBarExtraProps {
  icon?: Image.ImageLike;
  title?: string;
  tooltip?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

interface CustomMenuBarExtraItemProps {
  title: string;
  icon?: Image.ImageLike;
  subtitle?: string;
  tooltip?: string;
  onAction?: () => void | Promise<void>;
}

interface CustomMenuBarExtraSectionProps {
  title?: string;
  children?: React.ReactNode;
}

// Cast the original component to a typed React Function Component
const MenuBarExtra = MenuBarExtraOriginal as unknown as React.FC<CustomMenuBarExtraProps> & {
  Section: React.FC<CustomMenuBarExtraSectionProps>;
  Item: React.FC<CustomMenuBarExtraItemProps>;
};

export default function MuteMenuBar() {
  const preferences = getPreferenceValues<Preferences.MuteMenuBar>();
  const [isMuted, setIsMuted] = useState<boolean>(AudioInputLevelCache.curInputLevel === "0");

  useEffect(() => {
    const updateIconVisibility = () => {
      const currentAudioInputLevelCached = AudioInputLevelCache.curInputLevel;
      setIsMuted(currentAudioInputLevelCached === "0");
    };

    AudioInputLevelCache.addListener(updateIconVisibility);

    return () => {
      AudioInputLevelCache.removeListener(updateIconVisibility);
    };
  }, []);

  const iconColor = preferences.tint === "true" ? Color.Red : Color.PrimaryText;
  const disabledIcon = { source: Icon.MicrophoneDisabled, tintColor: iconColor };
  const enabledIcon = { source: Icon.Microphone };
  const icon = isMuted ? disabledIcon : enabledIcon;
  const menuItemText = isMuted ? "Unmute" : "Mute";

  const handleToggleIconButton = async () => {
    if (isMuted) {
      AudioInputLevelCache.curInputLevel = AudioInputLevelCache.prevInputLevel;
    } else {
      AudioInputLevelCache.prevInputLevel = AudioInputLevelCache.curInputLevel;
      AudioInputLevelCache.curInputLevel = "0";
    }
    await toggleSystemAudioInputLevel();
    setIsMuted(!isMuted);
  };

  if (preferences.hideIconWhenUnmuted && !isMuted) {
    return null;
  }

  // Force cast the return to JSX.Element to satisfy strict TS configurations
  return (
    <MenuBarExtra icon={icon} tooltip="Audio input volume">
      <MenuBarExtra.Section>
        <MenuBarExtra.Item title={menuItemText} onAction={handleToggleIconButton} />
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Configure default level" onAction={openExtensionPreferences} />
        <MenuBarExtra.Item icon={Icon.Gear} title="Settings" onAction={openCommandPreferences} />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  ) as unknown as JSX.Element;
}
