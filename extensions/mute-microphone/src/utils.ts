import { showToast, Toast, environment } from "@raycast/api";
import { runAppleScript } from "run-applescript";
import { AudioInputLevelCache } from "./audio-input-level-cache";
import { platform } from "os";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const isWindows = platform() === "win32";

async function getAudioInputLevel() {
  if (isWindows) {
    // Windows logic: placeholder implementation
    return "100";
  }

  const result = await runAppleScript(`
      set result to (input volume of (get volume settings))
      return result
    `);
  return result.trim();
}

export async function setAudioInputLevel(v: string) {
  if (isWindows) {
    const scriptPath = path.join(environment.assetsPath, "scripts", "windows-set-level.ps1");
    await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" -Level ${v}`);
    AudioInputLevelCache.curInputLevel = v;
    return;
  }
  await runAppleScript(`set volume input volume ${v}`);
  AudioInputLevelCache.curInputLevel = v;
}

const toggleWindowsMic = async (): Promise<string> => {
  try {
    const scriptPath = path.join(environment.assetsPath, "scripts", "windows-toggle.ps1");
    // Execute PowerShell script
    const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);

    // Determine status based on script output (Basic check)
    // If script returns "Muted", assume level 0, otherwise 100.
    const output = stdout.trim();
    if (output.toUpperCase().includes("MUTED")) {
      AudioInputLevelCache.curInputLevel = "0";
      return "0";
    } else {
      AudioInputLevelCache.curInputLevel = "100";
      return "100";
    }
  } catch (error) {
    console.error("Windows script error:", error);
    throw new Error("Failed to toggle microphone on Windows");
  }
};

const toggleSystemAudioInputLevelWithPreviousLevel = async (): Promise<string> => {
  if (isWindows) {
    return await toggleWindowsMic();
  }

  const currentLevel = await getAudioInputLevel();

  if (currentLevel === "0") {
    // unmute
    const prevInputLevel = AudioInputLevelCache.prevInputLevel;
    await setAudioInputLevel(prevInputLevel);
    AudioInputLevelCache.curInputLevel = prevInputLevel;
    return prevInputLevel;
  }

  // mute
  await setAudioInputLevel("0");
  AudioInputLevelCache.prevInputLevel = currentLevel;
  AudioInputLevelCache.curInputLevel = "0";
  return "0";
};

export const toggleSystemAudioInputLevel = async () => {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Running...",
  });

  try {
    const inputLevel = await toggleSystemAudioInputLevelWithPreviousLevel();

    if (inputLevel === "0") {
      toast.title = "Audio input muted";
      toast.style = Toast.Style.Failure;
    } else {
      toast.title = "Audio input unmuted";
      toast.style = Toast.Style.Success;
    }

    return inputLevel;
  } catch (error) {
    toast.title = "Error";
    toast.message = String(error);
    toast.style = Toast.Style.Failure;
    return "0"; // Fail safe
  }
};
