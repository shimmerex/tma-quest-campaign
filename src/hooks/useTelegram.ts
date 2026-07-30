import WebApp from '@twa-dev/sdk';

export function useTelegram() {
  // Check if running inside Telegram
  const isTelegram = (() => {
    try {
      return typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.platform !== 'unknown';
    } catch {
      return false;
    }
  })();

  const hapticFeedback = () => {
    try {
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch {
      // Silently fail outside Telegram
    }
  };

  const hapticSuccess = () => {
    try {
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch {
      // Silently fail
    }
  };

  const expand = () => {
    try {
      if (isTelegram) {
        WebApp.expand();
      }
    } catch {
      // Silently fail
    }
  };

  return {
    isTelegram,
    hapticFeedback,
    hapticSuccess,
    expand,
  };
}
