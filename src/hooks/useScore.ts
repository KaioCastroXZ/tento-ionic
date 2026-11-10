import { createContext, useContext } from 'react';

import type { SeriesState } from '../model/seriesState';
import type { SettingsState, ThemeMode } from '../model/settingsState';
import type { Team } from '../model/truco';

export interface ScoreContextValue {
  readonly series: SeriesState;
  /** Há uma série em andamento (decide entre a tela inicial e o placar). */
  readonly active: boolean;
  readonly settings: SettingsState;
  /** Tema resolvido (considera "Sistema"). */
  readonly isDark: boolean;

  addPoints: (team: Team, points: number) => void;
  removePoint: (team: Team) => void;
  undoLastAction: () => void;
  startNextGame: () => void;
  resetSeries: () => void;
  newSeries: (team1Name: string, team2Name: string, gamesToWin: number) => void;
  updateTeamName: (team: Team, name: string) => void;

  setThemeMode: (mode: ThemeMode) => void;
  setHaptics: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  resetAllData: () => Promise<void>;
}

export const ScoreContext = createContext<ScoreContextValue | null>(null);

export const useScore = (): ScoreContextValue => {
  const ctx = useContext(ScoreContext);
  if (!ctx) throw new Error('useScore precisa estar dentro de <ScoreProvider>');
  return ctx;
};
