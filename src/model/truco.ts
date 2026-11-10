/** Constantes de regra do Truco usadas pelo placar. O app apenas conta os tentos. */
export const WINNING_SCORE = 12;

/** Sequência de valores possíveis para uma mão: 1 → 3 → 6 → 9 → 12. */
export const HAND_VALUES = [1, 3, 6, 9, 12] as const;

export const TEAM_ONE = 1;
export const TEAM_TWO = 2;

export type Team = typeof TEAM_ONE | typeof TEAM_TWO;

export const isValidTeam = (team: unknown): team is Team => team === TEAM_ONE || team === TEAM_TWO;
