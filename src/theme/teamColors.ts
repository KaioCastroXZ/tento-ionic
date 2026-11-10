import { useScore } from '../hooks/useScore';
import { TEAM_ONE, type Team } from '../model/truco';

/**
 * Cores de uma dupla, em 3 papéis (a mesma cor de marca não serve para tudo):
 *  - accent:   preenchimentos e traços (friso, botão +, barra, bolinhas, badge)
 *  - onAccent: o que fica SOBRE o accent (ícone do +, check, texto do badge)
 *  - onCard:   a cor de marca como TEXTO sobre o card (mais escura no tema claro, contraste AA)
 */
export interface TeamColors {
  readonly accent: string;
  readonly onAccent: string;
  readonly onCard: string;
}

const GOLD = '#D4AF37';
const GOLD_INK_LIGHT = '#7A5F16';
const TRUCO_RED = '#C0392B';
const TRUCO_RED_BRIGHT = '#E74C3C';
const RED_INK_LIGHT = '#8A2820';
const OFF_WHITE = '#F5F1E6';
const INK_GREEN = '#0A2A1F';

export const teamColors = (team: Team, isDark: boolean): TeamColors =>
  team === TEAM_ONE
    ? { accent: GOLD, onAccent: INK_GREEN, onCard: isDark ? GOLD : GOLD_INK_LIGHT }
    : {
        accent: isDark ? TRUCO_RED_BRIGHT : TRUCO_RED,
        onAccent: OFF_WHITE,
        onCard: isDark ? TRUCO_RED_BRIGHT : RED_INK_LIGHT,
      };

export const useTeamColors = (team: Team): TeamColors => teamColors(team, useScore().isDark);
