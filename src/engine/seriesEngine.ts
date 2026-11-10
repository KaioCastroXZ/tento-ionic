/**
 * Regras de negócio da **série** (melhor de N partidas). TypeScript puro.
 * Compõe o `scoreEngine`, que cuida de uma partida individual (até 12 tentos).
 *
 * Quando uma partida chega a 12, ela é registrada em `completedGames`, mas a
 * partida atual CONTINUA mostrando o placar final (12 × N) até o usuário chamar
 * `startNextGame` ("Próxima partida").
 */
import type { GameResult } from '../model/gameResult';
import { isFinished, winner } from '../model/scoreState';
import {
  createSeriesState,
  isSeriesFinished,
  MAX_GAMES_TO_WIN,
  DEFAULT_GAMES_TO_WIN,
  type SeriesState,
} from '../model/seriesState';
import { TEAM_ONE, type Team } from '../model/truco';
import * as score from './scoreEngine';

const safeGamesToWin = (value: unknown): number =>
  score.coerceInt(value, 1, MAX_GAMES_TO_WIN, DEFAULT_GAMES_TO_WIN);

/** Higieniza uma série vinda da persistência (`gamesToWin` entre 1 e 3, partida atual válida). */
export const loadSeries = (state: SeriesState): SeriesState => ({
  ...state,
  gamesToWin: safeGamesToWin(state.gamesToWin),
  currentGame: score.sanitizeScore(state.currentGame),
  completedGames: Array.isArray(state.completedGames) ? state.completedGames : [],
});

/** Depois de mexer na partida: se ela fechou, registra o resultado mas mantém 12 × N à vista. */
const afterGameChange = (state: SeriesState, game: SeriesState['currentGame'], now: number): SeriesState => {
  if (!isFinished(game)) return { ...state, currentGame: game };
  const result: GameResult = {
    team1Score: game.team1Score,
    team2Score: game.team2Score,
    winner: winner(game) ?? TEAM_ONE,
    timestamp: now,
  };
  return { ...state, completedGames: [...state.completedGames, result], currentGame: game };
};

/** Ignorado quando a série acabou ou a partida atual já fechou (aguardando "Próxima partida"). */
export const addPoints = (
  state: SeriesState,
  team: Team,
  points: number,
  now: number = Date.now(),
): SeriesState => {
  if (isSeriesFinished(state) || isFinished(state.currentGame)) return state;
  return afterGameChange(state, score.addPoints(state.currentGame, team, points, now), now);
};

/** Remove um tento. Funciona mesmo com a partida em 12 — usado para corrigir uma partida reaberta. */
export const removePoint = (state: SeriesState, team: Team, now: number = Date.now()): SeriesState => {
  if (isSeriesFinished(state)) return state;
  return afterGameChange(state, score.removePoint(state.currentGame, team, now), now);
};

/**
 * Desfazer — 3 casos, nesta ordem:
 *  1. Partida encerrada ainda à vista → apaga o registro dela e tira o último tento.
 *  2. Partida em andamento com lançamentos → desfaz o último lançamento.
 *  3. Partida atual zerada mas há partidas encerradas → reabre a última com o placar final.
 */
export const undoLastAction = (state: SeriesState): SeriesState => {
  const game = state.currentGame;
  const lastCompleted = state.completedGames[state.completedGames.length - 1];
  const finishedAwaitingAdvance =
    isFinished(game) &&
    lastCompleted !== undefined &&
    lastCompleted.team1Score === game.team1Score &&
    lastCompleted.team2Score === game.team2Score;

  if (finishedAwaitingAdvance) {
    return {
      ...state,
      completedGames: state.completedGames.slice(0, -1),
      currentGame: score.undoLastAction(game),
    };
  }
  if (game.history.length > 0) {
    return { ...state, currentGame: score.undoLastAction(game) };
  }
  if (lastCompleted !== undefined) {
    return {
      ...state,
      completedGames: state.completedGames.slice(0, -1),
      currentGame: score.sanitizeScore({
        ...game,
        team1Score: lastCompleted.team1Score,
        team2Score: lastCompleted.team2Score,
        history: [],
      }),
    };
  }
  return state;
};

/** Confirma a partida encerrada e começa a próxima 0×0. Sem efeito se a série acabou. */
export const startNextGame = (state: SeriesState): SeriesState => {
  if (!isFinished(state.currentGame) || isSeriesFinished(state)) return state;
  return { ...state, currentGame: score.resetGame(state.currentGame) };
};

/** Zera a série inteira, mantendo nomes e formato (`gamesToWin`). */
export const resetSeries = (state: SeriesState): SeriesState =>
  createSeriesState({ gamesToWin: state.gamesToWin, currentGame: score.resetGame(state.currentGame) });

/** Começa uma nova série definindo nomes e quantas partidas vencem. */
export const newSeries = (team1Name: string, team2Name: string, gamesToWin: number): SeriesState =>
  createSeriesState({
    gamesToWin: safeGamesToWin(gamesToWin),
    currentGame: score.newGame(team1Name, team2Name),
  });

export const updateTeamName = (state: SeriesState, team: Team, name: string): SeriesState => ({
  ...state,
  currentGame: score.updateTeamName(state.currentGame, team, name),
});
