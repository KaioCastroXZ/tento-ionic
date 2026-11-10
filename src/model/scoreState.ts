import type { ScoreEvent } from './scoreEvent';
import { TEAM_ONE, TEAM_TWO, WINNING_SCORE, type Team } from './truco';

export const DEFAULT_TEAM_1 = 'Nossa Dupla';
export const DEFAULT_TEAM_2 = 'Adversários';

/**
 * Estado imutável de UMA partida. Guarda só dados "crus": o que é derivado
 * (vencedor etc.) vem das funções abaixo e nunca vai para o JSON.
 */
export interface ScoreState {
  readonly team1Name: string;
  readonly team2Name: string;
  readonly team1Score: number;
  readonly team2Score: number;
  readonly history: readonly ScoreEvent[];
}

export const createScoreState = (overrides: Partial<ScoreState> = {}): ScoreState => ({
  team1Name: DEFAULT_TEAM_1,
  team2Name: DEFAULT_TEAM_2,
  team1Score: 0,
  team2Score: 0,
  history: [],
  ...overrides,
});

/** Time vencedor (1 ou 2) ou `null` se a partida ainda está em andamento. */
export const winner = (s: ScoreState): Team | null => {
  if (s.team1Score >= WINNING_SCORE) return TEAM_ONE;
  if (s.team2Score >= WINNING_SCORE) return TEAM_TWO;
  return null;
};

export const isFinished = (s: ScoreState): boolean => winner(s) !== null;

/** `true` quando a partida já teve alguma pontuação registrada. */
export const hasProgress = (s: ScoreState): boolean => s.team1Score > 0 || s.team2Score > 0 || s.history.length > 0;

export const scoreOf = (s: ScoreState, team: Team): number => (team === TEAM_ONE ? s.team1Score : s.team2Score);

export const nameOf = (s: ScoreState, team: Team): string => (team === TEAM_ONE ? s.team1Name : s.team2Name);
