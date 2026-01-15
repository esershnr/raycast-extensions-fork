import { showToast, Toast, openExtensionPreferences } from "@raycast/api";
import { getNircmdExecutable } from "./utils";

export default async function main() {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Checking NirCmd status...",
  });

  try {
    const result = await getNircmdExecutable();

    if (result) {
      toast.style = Toast.Style.Success;
      if (result.type === "system") {
        toast.title = "NirCmd Found";
        toast.message = "Detected successfully in system PATH.";
      } else {
        toast.title = "NirCmd Configured";
        toast.message = "Using custom path from preferences.";
      }
    } else {
      toast.style = Toast.Style.Failure;
      toast.title = "NirCmd Not Found";
      toast.message = "It is not in your PATH and no valid custom path is set.";
      toast.primaryAction = {
        title: "Open Preferences",
        onAction: () => openExtensionPreferences(),
      };
    }
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Error";
    toast.message = String(error);
  }
}
