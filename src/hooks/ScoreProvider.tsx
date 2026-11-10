/**
 * Liga engine + persistência (papel do ScoreViewModel no app Android).
 * A UI nunca altera estado direto: chama o Provider → engine → salva → re-renderiza.
 */
import { useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';

import {
  clearAll,
  loadSession,
  loadSettings,
  saveSession,
  saveSettings,
  type Session,
} from '../data/preferencesRepository';
import * as series from '../engine/seriesEngine';
import { createSeriesState } from '../model/seriesState';
import { createSettingsState, type SettingsState } from '../model/settingsState';

import { ScoreContext, type ScoreContextValue } from './useScore';
import { useTheme } from './useTheme';

const INITIAL_SESSION: Session = { active: false, series: createSeriesState() };

export const ScoreProvider = ({ children }: { children: ReactNode }): ReactElement | null => {
  const [session, setSession] = useState<Session>(INITIAL_SESSION);
  const [settings, setSettings] = useState<SettingsState>(createSettingsState);
  // Só persiste depois da primeira leitura, para o estado inicial não sobrescrever o salvo.
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([loadSession(), loadSettings()]).then(([s, prefs]) => {
      if (cancelled) return;
      setSession({ active: s.active, series: series.loadSeries(s.series) });
      setSettings(prefs);
      setRestored(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (restored) void saveSession(session).catch(() => undefined);
  }, [restored, session]);

  useEffect(() => {
    if (restored) void saveSettings(settings).catch(() => undefined);
  }, [restored, settings]);

  const isDark = useTheme(settings.themeMode);

  // Atualizações funcionais: toques rápidos em sequência nunca perdem tentos.
  const update = useCallback((op: (s: Session['series']) => Session['series']) => {
    setSession((prev) => ({ ...prev, series: op(prev.series) }));
  }, []);

  const value = useMemo<ScoreContextValue>(
    () => ({
      series: session.series,
      active: session.active,
      settings,
      isDark,

      addPoints: (team, points) => update((s) => series.addPoints(s, team, points)),
      removePoint: (team) => update((s) => series.removePoint(s, team)),
      undoLastAction: () => update((s) => series.undoLastAction(s)),
      startNextGame: () => update((s) => series.startNextGame(s)),
      resetSeries: () => update((s) => series.resetSeries(s)),
      newSeries: (n1, n2, gamesToWin) => setSession({ active: true, series: series.newSeries(n1, n2, gamesToWin) }),
      updateTeamName: (team, name) => update((s) => series.updateTeamName(s, team, name)),

      setThemeMode: (themeMode) => setSettings((p) => ({ ...p, themeMode })),
      setHaptics: (hapticsEnabled) => setSettings((p) => ({ ...p, hapticsEnabled })),
      setSound: (soundEnabled) => setSettings((p) => ({ ...p, soundEnabled })),
      resetAllData: async () => {
        await clearAll();
        setSession(INITIAL_SESSION);
        setSettings(createSettingsState());
      },
    }),
    [session, settings, isDark, update],
  );

  if (!restored) return null;
  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
};
