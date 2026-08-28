type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, AnalyticsValue>) => void;
  }
}

export const trackEvent = (eventName: string, params: Record<string, AnalyticsValue> = {}) => {
  window.gtag?.("event", eventName, params);
};
