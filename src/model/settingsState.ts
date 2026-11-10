export type ThemeMode = 'system' | 'light' | 'dark';

export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

/** Preferências do usuário. Mantidas propositalmente enxutas. */
export interface SettingsState {
  readonly themeMode: ThemeMode;
  readonly hapticsEnabled: boolean;
  readonly soundEnabled: boolean;
}

export const createSettingsState = (overrides: Partial<SettingsState> = {}): SettingsState => ({
  themeMode: 'system',
  hapticsEnabled: true,
  soundEnabled: false,
  ...overrides,
});
