import { beforeEach, describe, expect, it } from 'vitest';

import { createScoreState, DEFAULT_TEAM_1, isFinished, winner, type ScoreState } from '../model/scoreState';
import { TEAM_ONE, TEAM_TWO, WINNING_SCORE } from '../model/truco';
import * as engine from './scoreEngine';

let clock = 0;
const now = () => ++clock;

/** Equivalente ao `engine.load(...)` do Kotlin: estado higienizado. */
const load = (overrides: Partial<ScoreState>) => engine.sanitizeScore(createScoreState(overrides));

describe('scoreEngine', () => {
  beforeEach(() => {
    clock = 0;
  });

  it('começa em zero a zero', () => {
    const s = createScoreState();
    expect(s.team1Score).toBe(0);
    expect(s.team2Score).toBe(0);
    expect(s.history).toEqual([]);
    expect(winner(s)).toBeNull();
  });

  it('adicionar 1 tento', () => {
    const s = engine.addPoints(createScoreState(), TEAM_ONE, 1, now());
    expect(s.team1Score).toBe(1);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].points).toBe(1);
  });

  it('adicionar 3 tentos (truco)', () => {
    expect(engine.addPoints(createScoreState(), TEAM_TWO, 3, now()).team2Score).toBe(3);
  });

  it('adicionar 6 tentos', () => {
    expect(engine.addPoints(createScoreState(), TEAM_ONE, 6, now()).team1Score).toBe(6);
  });

  it('adicionar 9 tentos', () => {
    expect(engine.addPoints(createScoreState(), TEAM_ONE, 9, now()).team1Score).toBe(9);
  });

  it('exemplo do enunciado: 4x2 mais 3 vira 7x2', () => {
    const s = engine.addPoints(load({ team1Score: 4, team2Score: 2 }), TEAM_ONE, 3, now());
    expect(s.team1Score).toBe(7);
    expect(s.team2Score).toBe(2);
  });

  it('não ultrapassa 12 e registra apenas a variação aplicada', () => {
    const s = engine.addPoints(load({ team1Score: 10 }), TEAM_ONE, 3, now());
    expect(s.team1Score).toBe(12);
    expect(s.history[s.history.length - 1].points).toBe(2);
  });

  it('não fica abaixo de zero (e nada aplicado não gera evento)', () => {
    const s = engine.removePoint(createScoreState(), TEAM_ONE, now());
    expect(s.team1Score).toBe(0);
    expect(s.history).toEqual([]);
  });

  it('remover um tento', () => {
    const s = engine.removePoint(load({ team1Score: 5 }), TEAM_ONE, now());
    expect(s.team1Score).toBe(4);
    expect(s.history[s.history.length - 1].points).toBe(-1);
  });

  it('desfazer última ação', () => {
    let s = engine.addPoints(createScoreState(), TEAM_ONE, 3, now());
    s = engine.addPoints(s, TEAM_TWO, 1, now());
    s = engine.undoLastAction(s);
    expect(s.team1Score).toBe(3);
    expect(s.team2Score).toBe(0);
    expect(s.history).toHaveLength(1);
  });

  it('desfazer sem histórico não quebra', () => {
    expect(engine.undoLastAction(createScoreState()).team1Score).toBe(0);
  });

  it('desfazer restaura pontuação limitada', () => {
    let s = engine.addPoints(load({ team1Score: 10 }), TEAM_ONE, 6, now()); // aplica só +2 -> 12
    s = engine.undoLastAction(s);
    expect(s.team1Score).toBe(10);
    expect(s.history).toEqual([]);
  });

  it('resetar partida zera placar e histórico mantendo nomes', () => {
    let s = engine.updateTeamName(createScoreState(), TEAM_ONE, 'João & Pedro');
    s = engine.addPoints(s, TEAM_ONE, 6, now());
    s = engine.resetGame(s);
    expect(s.team1Score).toBe(0);
    expect(s.history).toEqual([]);
    expect(s.team1Name).toBe('João & Pedro');
  });

  it('detecta vencedor ao chegar em 12', () => {
    let s = load({ team1Score: 9 });
    expect(winner(s)).toBeNull();
    s = engine.addPoints(s, TEAM_ONE, 3, now());
    expect(winner(s)).toBe(TEAM_ONE);
    expect(isFinished(s)).toBe(true);
  });

  it('alterar nome das equipes', () => {
    let s = engine.updateTeamName(createScoreState(), TEAM_ONE, '  Nós  ');
    s = engine.updateTeamName(s, TEAM_TWO, 'Eles');
    expect(s.team1Name).toBe('Nós');
    expect(s.team2Name).toBe('Eles');
  });

  it('nome vazio volta ao padrão', () => {
    expect(engine.updateTeamName(createScoreState(), TEAM_ONE, '   ').team1Name).toBe(DEFAULT_TEAM_1);
  });

  it('nome é limitado a 24 caracteres', () => {
    const s = engine.updateTeamName(createScoreState(), TEAM_ONE, 'x'.repeat(40));
    expect(s.team1Name).toHaveLength(24);
  });

  it('nova partida define nomes e zera', () => {
    const before = engine.addPoints(createScoreState(), TEAM_ONE, 6, now());
    expect(before.team1Score).toBe(6);
    const s = engine.newGame('A', 'B');
    expect(s.team1Name).toBe('A');
    expect(s.team2Name).toBe('B');
    expect(s.team1Score).toBe(0);
    expect(isFinished(s)).toBe(false);
  });

  it('load restaura estado completo (salvar e recuperar)', () => {
    const restored = load({ team1Name: 'Carlos & Lucas', team2Name: 'Ana & Bia', team1Score: 7, team2Score: 11 });
    expect(restored.team1Score).toBe(7);
    expect(restored.team2Score).toBe(11);
    expect(restored.team1Name).toBe('Carlos & Lucas');
    // continua marcando a partir do estado restaurado
    expect(winner(engine.addPoints(restored, TEAM_TWO, 1, now()))).toBe(TEAM_TWO);
  });

  it('load sanea valores inválidos', () => {
    const s = load({ team1Score: 99, team2Score: -3, team1Name: '' });
    expect(s.team1Score).toBe(WINNING_SCORE);
    expect(s.team2Score).toBe(0);
    expect(s.team1Name).toBe(DEFAULT_TEAM_1);
  });

  it('load sanea tipos errados (NaN, string, null)', () => {
    const bad = { ...createScoreState(), team1Score: NaN, team2Score: '7', team1Name: null } as unknown as ScoreState;
    const s = engine.sanitizeScore(bad);
    expect(s.team1Score).toBe(0);
    expect(s.team2Score).toBe(0);
    expect(s.team1Name).toBe(DEFAULT_TEAM_1);
  });

  it('time inválido lança erro', () => {
    expect(() => engine.addPoints(createScoreState(), 3 as never, 1)).toThrow();
  });
});
