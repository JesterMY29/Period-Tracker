export type AppTab = 'home' | 'calendar' | 'history' | 'settings';

export const APP_TABS: readonly AppTab[] = ['home', 'calendar', 'history', 'settings'];

export const DEFAULT_APP_TAB: AppTab = 'home';

/**
 * Keeps navigation state inside the documented application tab contract.
 * Unknown persisted or external values fail closed to Home rather than
 * creating an invalid render state.
 */
export function resolveAppTab(value: string | null | undefined): AppTab {
  return value && APP_TABS.includes(value as AppTab)
    ? (value as AppTab)
    : DEFAULT_APP_TAB;
}
