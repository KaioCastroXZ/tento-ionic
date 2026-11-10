import type { Team } from './truco';

/**
 * Registro de uma alteração de pontuação no histórico da partida.
 * `points` é a variação aplicada de fato (já considera os limites 0 e 12).
 */
export interface ScoreEvent {
  readonly team: Team;
  readonly points: number;
  /** epoch millis */
  readonly timestamp: number;
}
