import { TEAM_ONE, type Team } from './truco';

/** Resultado de uma partida (até 12 tentos) já encerrada dentro de uma série. */
export interface GameResult {
  readonly team1Score: number;
  readonly team2Score: number;
  readonly winner: Team;
  /** epoch millis */
  readonly timestamp: number;
}

export const gameScoreOf = (g: GameResult, team: Team): number => (team === TEAM_ONE ? g.team1Score : g.team2Score);
