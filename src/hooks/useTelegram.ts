export function useTelegram() {
  const getWebApp = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      return (window as any).Telegram.WebApp;
    }
    return null;
  };

  const isTelegram = (() => {
    try {
      const webApp = getWebApp();
      return webApp && webApp.platform !== 'unknown';
    } catch {
      return false;
    }
  })();

  const hapticFeedback = () => {
    try {
      const webApp = getWebApp();
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('light');
      }
    } catch {
      // Silently fail outside Telegram
    }
  };

  const hapticSuccess = () => {
    try {
      const webApp = getWebApp();
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
    } catch {
      // Silently fail
    }
  };

  const expand = () => {
    try {
      const webApp = getWebApp();
      if (webApp) {
        webApp.expand();
      }
    } catch {
      // Silently fail
    }
  };

  const ready = () => {
    try {
      const webApp = getWebApp();
      if (webApp) {
        webApp.ready();
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
    ready,
  };
}
