import type { GameResult } from './gameResult';
import { createScoreState, isFinished, nameOf as gameNameOf, scoreOf, type ScoreState } from './scoreState';
import { TEAM_ONE, TEAM_TWO, type Team } from './truco';

export const DEFAULT_GAMES_TO_WIN = 3;
export const MAX_GAMES_TO_WIN = 3;
export const GAMES_TO_WIN_OPTIONS = [1, 2, 3] as const;

/**
 * Estado de uma **série** (melhor de N). `gamesToWin === 1` é partida única.
 * Partidas encerradas ficam em `completedGames`.
 */
export interface SeriesState {
  readonly gamesToWin: number;
  readonly currentGame: ScoreState;
  readonly completedGames: readonly GameResult[];
}

export const createSeriesState = (overrides: Partial<SeriesState> = {}): SeriesState => ({
  gamesToWin: DEFAULT_GAMES_TO_WIN,
  currentGame: createScoreState(),
  completedGames: [],
  ...overrides,
});

export const team1Name = (s: SeriesState): string => s.currentGame.team1Name;
export const team2Name = (s: SeriesState): string => s.currentGame.team2Name;

export const team1Games = (s: SeriesState): number => s.completedGames.filter((g) => g.winner === TEAM_ONE).length;
export const team2Games = (s: SeriesState): number => s.completedGames.filter((g) => g.winner === TEAM_TWO).length;

export const gamesOf = (s: SeriesState, team: Team): number => (team === TEAM_ONE ? team1Games(s) : team2Games(s));

/** Dupla que venceu a série (1 ou 2), ou `null` se ainda está em disputa. */
export const seriesWinner = (s: SeriesState): Team | null => {
  if (team1Games(s) >= s.gamesToWin) return TEAM_ONE;
  if (team2Games(s) >= s.gamesToWin) return TEAM_TWO;
  return null;
};

export const isSeriesFinished = (s: SeriesState): boolean => seriesWinner(s) !== null;

/** `true` quando a série é de uma única partida. */
export const isSingleGame = (s: SeriesState): boolean => s.gamesToWin <= 1;

/** Número da partida atual (1-based). */
export const currentGameNumber = (s: SeriesState): number =>
  isFinished(s.currentGame) ? Math.max(s.completedGames.length, 1) : s.completedGames.length + 1;

export const seriesHasProgress = (s: SeriesState): boolean =>
  s.completedGames.length > 0 ||
  s.currentGame.team1Score > 0 ||
  s.currentGame.team2Score > 0 ||
  s.currentGame.history.length > 0;

export const seriesNameOf = (s: SeriesState, team: Team): string => gameNameOf(s.currentGame, team);

/** Tentos a exibir no placar (o "vivo", ou o 12 × N final enquanto aguarda avançar). */
export const boardScoreOf = (s: SeriesState, team: Team): number => scoreOf(s.currentGame, team);

/** Placar da última partida encerrada (`null` se nenhuma terminou ainda). */
export const lastGame = (s: SeriesState): GameResult | null =>
  s.completedGames.length > 0 ? s.completedGames[s.completedGames.length - 1] : null;

/**
 * Partida atual já fechada (12 tentos) e registrada, à vista, aguardando
 * "Próxima partida". É falso quando o "Desfazer" reabre a última partida em
 * 12 × N sem registrá-la (caso 3 do desfazer).
 */
export const isAwaitingAdvance = (s: SeriesState): boolean => {
  const last = lastGame(s);
  return (
    isFinished(s.currentGame) &&
    last !== null &&
    last.team1Score === s.currentGame.team1Score &&
    last.team2Score === s.currentGame.team2Score
  );
};

/** Há algo para desfazer (lançamento da partida atual ou partida encerrada para reabrir). */
export const canUndo = (s: SeriesState): boolean => s.currentGame.history.length > 0 || s.completedGames.length > 0;
