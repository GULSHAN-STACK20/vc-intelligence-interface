export type ToastKind = 'success' | 'error' | 'info';

export const toast = (message: string, kind: ToastKind = 'success') => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, kind } }));
};
