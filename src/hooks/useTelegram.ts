import WebApp from '@twa-dev/sdk';

export function useTelegram() {
  // Check if running inside Telegram
  const isTelegram = (() => {
    try {
      return !!(window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData;
    } catch {
      return false;
    }
  })();

  const hapticFeedback = () => {
    try {
      if (isTelegram) {
        WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch {
      // Silently fail outside Telegram
    }
  };

  const hapticSuccess = () => {
    try {
      if (isTelegram) {
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
