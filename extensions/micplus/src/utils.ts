import { showHUD, showToast, Toast, getPreferenceValues, openExtensionPreferences } from "@raycast/api";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";

const execAsync = promisify(exec);

interface Preferences {
  nircmdPath?: string;
}

/**
 * Checks if nircmd is available in the system PATH.
 */
async function isNircmdInPath(): Promise<boolean> {
  try {
    await execAsync("where nircmd");
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the nircmd executable path or command based on preferences and system environment.
 * Returns null if not found.
 */
export async function getNircmdExecutable(): Promise<{ command: string; type: "path" | "system" } | null> {
  const preferences = getPreferenceValues<Preferences>();

  // 1. Check User Preference
  if (preferences.nircmdPath && preferences.nircmdPath.trim() !== "") {
    if (existsSync(preferences.nircmdPath)) {
      return { command: `"${preferences.nircmdPath}"`, type: "path" };
    }
    // Path defined but invalid
    return null;
  }

  // 2. Check System PATH
  if (await isNircmdInPath()) {
    return { command: "nircmd", type: "system" };
  }

  return null;
}

export async function toggleMicrophone(mode: "0" | "1" | "2") {
  try {
    const result = await getNircmdExecutable();

    if (!result) {
      await showToast({
        style: Toast.Style.Failure,
        title: "NirCmd Missing",
        message: "NirCmd not found. Please configure it in preferences.",
        primaryAction: {
          title: "Open Preferences",
          onAction: () => openExtensionPreferences(),
        },
      });
      return;
    }

    const target = "default_record";
    await execAsync(`${result.command} mutesysvolume ${mode} ${target}`);

    let message = "Microphone state toggled";
    if (mode === "1") message = "Microphone muted";
    else if (mode === "0") message = "Microphone unmuted";

    await showHUD(message);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await showToast({
      style: Toast.Style.Failure,
      title: "Error Occurred",
      message: errorMessage,
    });
  }
}
