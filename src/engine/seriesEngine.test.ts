import { beforeEach, describe, expect, it } from 'vitest';

import type { GameResult } from '../model/gameResult';
import { createScoreState, isFinished } from '../model/scoreState';
import {
  boardScoreOf,
  createSeriesState,
  currentGameNumber,
  isAwaitingAdvance,
  isSeriesFinished,
  lastGame,
  MAX_GAMES_TO_WIN,
  seriesWinner,
  team1Games,
  team1Name,
  team2Games,
  team2Name,
  type SeriesState,
} from '../model/seriesState';
import { TEAM_ONE, TEAM_TWO, type Team } from '../model/truco';

import * as engine from './seriesEngine';

let clock = 0;
const now = () => ++clock;

let s: SeriesState;

/** Leva um time a 12 tentos (a partida encerra mas continua à vista). */
const winGame = (team: Team) => {
  for (let i = 0; i < 4; i++) s = engine.addPoints(s, team, 3, now());
};

/** Vence a partida e já avança para a próxima. */
const winGameAndAdvance = (team: Team) => {
  winGame(team);
  s = engine.startNextGame(s);
};

describe('seriesEngine', () => {
  beforeEach(() => {
    clock = 0;
    s = engine.loadSeries(createSeriesState({ gamesToWin: 3 }));
  });

  it('série começa zerada', () => {
    expect(team1Games(s)).toBe(0);
    expect(team2Games(s)).toBe(0);
    expect(s.completedGames).toEqual([]);
    expect(seriesWinner(s)).toBeNull();
    expect(currentGameNumber(s)).toBe(1);
  });

  it('partida encerrada é registrada mas continua à vista até avançar', () => {
    winGame(TEAM_ONE);
    expect(s.completedGames).toHaveLength(1);
    expect(s.completedGames[0].team1Score).toBe(12);
    expect(s.completedGames[0].winner).toBe(TEAM_ONE);
    // 12 x 0 continua à vista (diálogo e placar mostram o mesmo número)
    expect(isFinished(s.currentGame)).toBe(true);
    expect(boardScoreOf(s, TEAM_ONE)).toBe(12);
    expect(team1Games(s)).toBe(1);

    s = engine.startNextGame(s);
    expect(s.currentGame.team1Score).toBe(0);
    expect(s.currentGame.team2Score).toBe(0);
    expect(currentGameNumber(s)).toBe(2);
    expect(isSeriesFinished(s)).toBe(false);
  });

  it('startNextGame não faz nada com partida em andamento', () => {
    s = engine.addPoints(s, TEAM_ONE, 3, now());
    s = engine.startNextGame(s);
    expect(s.currentGame.team1Score).toBe(3);
  });

  it('pontos ignorados enquanto a partida encerrada aguarda avançar', () => {
    winGame(TEAM_ONE);
    s = engine.addPoints(s, TEAM_TWO, 3, now());
    expect(s.currentGame.team2Score).toBe(0);
    expect(s.completedGames).toHaveLength(1);
  });

  it('série termina quando um time vence gamesToWin partidas', () => {
    winGameAndAdvance(TEAM_ONE);
    winGameAndAdvance(TEAM_TWO);
    winGameAndAdvance(TEAM_ONE);
    expect(seriesWinner(s)).toBeNull();
    winGame(TEAM_ONE);
    expect(seriesWinner(s)).toBe(TEAM_ONE);
    expect(isSeriesFinished(s)).toBe(true);
    expect(team1Games(s)).toBe(3);
    expect(team2Games(s)).toBe(1);
    expect(boardScoreOf(s, TEAM_ONE)).toBe(12);
    expect(lastGame(s)?.team1Score).toBe(12);
  });

  it('pontos são ignorados depois da série encerrada', () => {
    s = engine.loadSeries(createSeriesState({ gamesToWin: 1 }));
    winGame(TEAM_ONE);
    expect(isSeriesFinished(s)).toBe(true);
    const before = s;
    s = engine.addPoints(s, TEAM_TWO, 3, now());
    expect(s).toEqual(before);
  });

  it('partida única termina a série', () => {
    s = engine.loadSeries(createSeriesState({ gamesToWin: 1 }));
    winGame(TEAM_TWO);
    expect(seriesWinner(s)).toBe(TEAM_TWO);
    expect(s.completedGames).toHaveLength(1);
  });

  it('desfazer dentro da partida atual', () => {
    s = engine.addPoints(s, TEAM_ONE, 3, now());
    s = engine.addPoints(s, TEAM_TWO, 1, now());
    s = engine.undoLastAction(s);
    expect(s.currentGame.team1Score).toBe(3);
    expect(s.currentGame.team2Score).toBe(0);
  });

  it('desfazer partida encerrada à vista tira o tento e o registro', () => {
    s = engine.addPoints(s, TEAM_ONE, 9, now());
    s = engine.addPoints(s, TEAM_ONE, 3, now()); // 9 -> 12, encerra
    expect(s.completedGames).toHaveLength(1);
    expect(isFinished(s.currentGame)).toBe(true);
    expect(isAwaitingAdvance(s)).toBe(true);

    s = engine.undoLastAction(s);
    expect(s.completedGames).toHaveLength(0);
    expect(s.currentGame.team1Score).toBe(9);
    expect(isFinished(s.currentGame)).toBe(false);
    expect(isSeriesFinished(s)).toBe(false);
  });

  it('desfazer depois de avançar reabre a última partida encerrada', () => {
    s = engine.addPoints(s, TEAM_ONE, 9, now());
    s = engine.addPoints(s, TEAM_ONE, 3, now());
    s = engine.startNextGame(s);
    expect(s.currentGame.team1Score).toBe(0);

    s = engine.undoLastAction(s);
    expect(s.completedGames).toHaveLength(0);
    expect(s.currentGame.team1Score).toBe(12);
    expect(isSeriesFinished(s)).toBe(false);
    // reaberta em 12 x N, sem registro: não está "aguardando avançar"
    expect(isAwaitingAdvance(s)).toBe(false);

    s = engine.removePoint(s, TEAM_ONE, now());
    expect(s.currentGame.team1Score).toBe(11);
  });

  it('desfazer a partida decisiva des-encerra a série', () => {
    winGameAndAdvance(TEAM_ONE);
    winGameAndAdvance(TEAM_ONE);
    winGame(TEAM_ONE); // decisiva, à vista
    expect(isSeriesFinished(s)).toBe(true);

    s = engine.undoLastAction(s);
    expect(isSeriesFinished(s)).toBe(false);
    expect(team1Games(s)).toBe(2);
    expect(s.currentGame.team1Score).toBe(9);
  });

  it('resetar série mantém nomes e formato', () => {
    s = engine.updateTeamName(s, TEAM_ONE, 'João & Pedro');
    winGame(TEAM_ONE);
    s = engine.resetSeries(s);
    expect(s.completedGames).toHaveLength(0);
    expect(s.currentGame.team1Score).toBe(0);
    expect(team1Name(s)).toBe('João & Pedro');
    expect(s.gamesToWin).toBe(3);
  });

  it('nova série define nomes e formato', () => {
    winGame(TEAM_ONE);
    s = engine.newSeries('A', 'B', 2);
    expect(team1Name(s)).toBe('A');
    expect(team2Name(s)).toBe('B');
    expect(s.gamesToWin).toBe(2);
    expect(s.completedGames).toEqual([]);
  });

  it('load sanea gamesToWin', () => {
    expect(engine.loadSeries(createSeriesState({ gamesToWin: 99 })).gamesToWin).toBe(MAX_GAMES_TO_WIN);
    expect(engine.loadSeries(createSeriesState({ gamesToWin: 0 })).gamesToWin).toBe(1);
    expect(engine.loadSeries(createSeriesState({ gamesToWin: NaN })).gamesToWin).toBe(3);
    expect(engine.newSeries('A', 'B', 99).gamesToWin).toBe(MAX_GAMES_TO_WIN);
  });

  it('load restaura série completa (salvar e recuperar)', () => {
    const completed: GameResult = { team1Score: 12, team2Score: 5, winner: TEAM_ONE, timestamp: 100 };
    s = engine.loadSeries(
      createSeriesState({
        gamesToWin: 2,
        currentGame: createScoreState({ team1Name: 'Nós', team2Name: 'Eles', team1Score: 7 }),
        completedGames: [completed],
      }),
    );
    expect(team1Games(s)).toBe(1);
    expect(s.currentGame.team1Score).toBe(7);
    expect(team1Name(s)).toBe('Nós');
    // uma vitória a mais fecha a série (gamesToWin = 2)
    for (let i = 0; i < 4; i++) s = engine.addPoints(s, TEAM_ONE, 3, i);
    expect(seriesWinner(s)).toBe(TEAM_ONE);
  });

  it('alterar nome durante a série não afeta placar', () => {
    s = engine.addPoints(s, TEAM_ONE, 6, now());
    s = engine.updateTeamName(s, TEAM_ONE, '  Nova  ');
    expect(team1Name(s)).toBe('Nova');
    expect(s.currentGame.team1Score).toBe(6);
  });
});
