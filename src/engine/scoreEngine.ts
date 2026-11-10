/**
 * Regras de negócio do contador de tentos (UMA partida). TypeScript puro:
 * nenhuma dependência de React, Ionic ou Capacitor.
 *
 * O estado é imutável: cada operação recebe um `ScoreState` e devolve um NOVO.
 */
import type { ScoreEvent } from '../model/scoreEvent';
import {
  createScoreState,
  DEFAULT_TEAM_1,
  DEFAULT_TEAM_2,
  scoreOf,
  type ScoreState,
} from '../model/scoreState';
import { isValidTeam, TEAM_ONE, TEAM_TWO, WINNING_SCORE, type Team } from '../model/truco';

export const MAX_NAME_LENGTH = 24;

/** Limita `value` ao intervalo [min, max]. Qualquer coisa que não seja número inteiro finito vira `fallback`. */
export const coerceInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback;
  return Math.min(Math.max(n, min), max);
};

/** `trim`, máx. 24 caracteres; vazio (ou não-string) → `fallback`. */
export const normalizeName = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, MAX_NAME_LENGTH);
  return trimmed.trim() === '' ? fallback : trimmed;
};

/** Higieniza um estado vindo da persistência (nomes, placar entre 0 e 12). */
export const sanitizeScore = (state: ScoreState): ScoreState => ({
  ...state,
  team1Name: normalizeName(state.team1Name, DEFAULT_TEAM_1),
  team2Name: normalizeName(state.team2Name, DEFAULT_TEAM_2),
  team1Score: coerceInt(state.team1Score, 0, WINNING_SCORE, 0),
  team2Score: coerceInt(state.team2Score, 0, WINNING_SCORE, 0),
  history: Array.isArray(state.history) ? state.history : [],
});

const requireTeam = (team: unknown): asserts team is Team => {
  if (!isValidTeam(team)) throw new Error(`Time inválido: ${String(team)}`);
};

const withScore = (state: ScoreState, team: Team, score: number): Pick<ScoreState, 'team1Score' | 'team2Score'> => ({
  team1Score: team === TEAM_ONE ? score : state.team1Score,
  team2Score: team === TEAM_TWO ? score : state.team2Score,
});

/**
 * Adiciona (ou remove, se negativo) tentos, respeitando os limites 0 e 12.
 * Registra no histórico apenas a variação aplicada de fato.
 */
export const addPoints = (
  state: ScoreState,
  team: Team,
  points: number,
  now: number = Date.now(),
): ScoreState => {
  requireTeam(team);
  if (points === 0) return state;

  const current = scoreOf(state, team);
  const target = Math.min(Math.max(current + points, 0), WINNING_SCORE);
  const applied = target - current;
  if (applied === 0) return state;

  const event: ScoreEvent = { team, points: applied, timestamp: now };
  return { ...state, ...withScore(state, team, target), history: [...state.history, event] };
};

/** Remove um tento do time (nunca abaixo de 0). */
export const removePoint = (state: ScoreState, team: Team, now: number = Date.now()): ScoreState =>
  addPoints(state, team, -1, now);

/** Desfaz a última alteração de pontuação. */
export const undoLastAction = (state: ScoreState): ScoreState => {
  const last = state.history[state.history.length - 1];
  if (!last) return state;
  const restored = Math.min(Math.max(scoreOf(state, last.team) - last.points, 0), WINNING_SCORE);
  return { ...state, ...withScore(state, last.team, restored), history: state.history.slice(0, -1) };
};

/** Zera placar e histórico, mantendo os nomes das duplas. */
export const resetGame = (state: ScoreState): ScoreState =>
  createScoreState({ team1Name: state.team1Name, team2Name: state.team2Name });

/** Inicia uma nova partida definindo os nomes das duplas. */
export const newGame = (team1Name: string, team2Name: string): ScoreState =>
  createScoreState({
    team1Name: normalizeName(team1Name, DEFAULT_TEAM_1),
    team2Name: normalizeName(team2Name, DEFAULT_TEAM_2),
  });

/** Atualiza o nome de uma das duplas sem afetar o placar. */
export const updateTeamName = (state: ScoreState, team: Team, name: string): ScoreState => {
  requireTeam(team);
  const clean = normalizeName(name, team === TEAM_ONE ? DEFAULT_TEAM_1 : DEFAULT_TEAM_2);
  return team === TEAM_ONE ? { ...state, team1Name: clean } : { ...state, team2Name: clean };
};
