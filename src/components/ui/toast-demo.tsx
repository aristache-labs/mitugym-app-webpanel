"use client";

import { useToast } from "./toast";

export function ToastDemo() {
  const { addToast } = useToast();

  const showSuccess = () => {
    addToast({
      type: "success",
      title: "Everything looks good",
      description: "+300 rectangles created successfully. Nice shadows btw.",
      duration: 5000,
    });
  };

  const showWarning = () => {
    addToast({
      type: "warning",
      title: "Crunching numbers...",
      description: "RAM status: 85% used. Don't push it too hard, please?",
      duration: 5000,
    });
  };

  const showError = () => {
    addToast({
      type: "error",
      title: "Out of RAM",
      description: "Too many pixels in play. Consider a CTRL+Z or two.",
      duration: 5000,
    });
  };

  const showMultiple = () => {
    addToast({
      type: "success",
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
      duration: 6000,
    });
    
    setTimeout(() => {
      addToast({
        type: "warning",
        title: "Password expiring soon",
        description: "Your password will expire in 7 days.",
        duration: 6000,
      });
    }, 500);
    
    setTimeout(() => {
      addToast({
        type: "error",
        title: "Failed to sync",
        description: "Could not sync with remote server. Check your connection.",
        duration: 6000,
      });
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[10000] space-y-2">
      <div className="bg-card/95 backdrop-blur-xl border border-surface/30 rounded-2xl p-4 shadow-2xl">
        <h3 className="text-sm font-bold text-text mb-3">Toast Demo</h3>
        <div className="space-y-2">
          <button
            onClick={showSuccess}
            className="w-full px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all duration-200 active:scale-95 border border-primary/30"
          >
            Show Success
          </button>
          <button
            onClick={showWarning}
            className="w-full px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-sm font-medium transition-all duration-200 active:scale-95 border border-yellow-500/30"
          >
            Show Warning
          </button>
          <button
            onClick={showError}
            className="w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all duration-200 active:scale-95 border border-red-500/30"
          >
            Show Error
          </button>
          <button
            onClick={showMultiple}
            className="w-full px-4 py-2 rounded-lg bg-surface/80 hover:bg-surface text-text text-sm font-medium transition-all duration-200 active:scale-95 border border-surface/40"
          >
            Show Multiple
          </button>
        </div>
      </div>
    </div>
  );
}

