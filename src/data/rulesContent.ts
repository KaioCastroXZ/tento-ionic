/** Textos das regras, copiados de RulesScreen.kt / HowToPlayScreen.kt do app original. */
export interface RuleItem {
  readonly label?: string;
  readonly text: string;
}

export type VariantId = 'paulista' | 'goiano' | 'mineiro';

export const INTRO: readonly string[] = [
  'As regras do Truco variam bastante entre regiões e até entre mesas. Os resumos abaixo mostram as versões mais comuns de cada variante.',
  'Para o placar, o que importa é igual nas três: a partida vai até 12 tentos e a mão pode valer 1, 3 (truco), 6, 9 ou 12.',
];

export const HAND_TABLE: readonly (readonly [string, string])[] = [
  ['Mão normal', '1'],
  ['Truco', '3'],
  ['Seis', '6'],
  ['Nove', '9'],
  ['Doze', '12'],
];

export const HOW_TO_PLAY = {
  essential: 'A partida vai até 12 tentos.',
  series: [
    'Ao criar uma partida você escolhe quantas partidas vencem a série (1, 2 ou 3). Ex.: escolhendo 3, vence a série a primeira dupla a ganhar 3 partidas de 12 tentos.',
    'Cada partida encerrada fica registrada no histórico e o placar de partidas aparece embaixo do nome de cada dupla.',
  ],
  usage: [
    'Toque no + de uma dupla para somar 1 tento.',
    'Toque no botão TRUCO para somar 3 de uma vez.',
    'Toque no número para escolher +1, +3, +6, +9 ou +12.',
    'Errou? Use "Desfazer" — no placar ou no histórico. Ele até reabre a última partida encerrada.',
  ],
} as const;

export const COMMON: readonly RuleItem[] = [
  { label: 'Objetivo', text: 'Vence a dupla que chegar primeiro a 12 tentos.' },
  { label: 'Valor da mão', text: 'Começa valendo 1 e sobe na sequência: 1 → 3 → 6 → 9 → 12.' },
  {
    text: 'Se a dupla desafiada corre (recusa), quem pediu marca os tentos do valor anterior da mão. Ex.: mão valendo 1, pediram truco e o outro correu → quem pediu marca 1.',
  },
  { label: 'Rodadas', text: 'Cada jogador recebe 3 cartas; a mão tem até 3 rodadas e vence quem levar 2.' },
  { label: 'Naipe das manilhas', text: 'Da mais forte para a mais fraca: Paus > Copas > Espadas > Ouros.' },
];

export const VARIANTS: readonly { id: VariantId; title: string; items: readonly RuleItem[] }[] = [
  {
    id: 'paulista',
    title: 'Truco Paulista',
    items: [
      {
        label: 'Manilhas',
        text: 'Variáveis. Ao distribuir, vira-se uma carta (a "vira"); as quatro cartas do valor seguinte à vira são as manilhas daquela mão.',
      },
      { label: 'Ordem das cartas comuns', text: '3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4.' },
      { label: 'Detalhe', text: 'É a variante usada como base do app. Não tem manilha fixa nem mão de 11.' },
    ],
  },
  {
    id: 'goiano',
    title: 'Truco Goiano',
    items: [
      {
        label: 'Baralho e manilhas',
        text: '40 cartas, com manilhas fixas na mesma ordem do Truco Mineiro (Zap 4♣, 7♥, Espadão A♠, 7♦). Não tem vira.',
      },
      {
        label: 'Valor da mão',
        text: 'Sobe na sequência 1 → 3 → 6 → 9 → 12, como no Paulista. Pode-se pedir truco em qualquer rodada; se a dupla corre, quem pediu marca o valor anterior.',
      },
      { label: 'Mão de 11', text: 'Costuma valer, como no Mineiro (a dupla com 11 vê as cartas e decide jogar).' },
    ],
  },
  {
    id: 'mineiro',
    title: 'Truco Mineiro',
    items: [
      { label: 'Baralho', text: '40 cartas (sem 8, 9 e 10). Não tem vira.' },
      {
        label: 'Manilhas fixas',
        text: 'Sempre as mesmas quatro cartas, da mais forte para a mais fraca:\n• Zap — 4 de paus\n• Copas — 7 de copas\n• Espadão — Ás de espadas\n• Pica-fumo — 7 de ouros',
      },
      { label: 'Ordem das cartas comuns', text: '3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4.' },
      {
        label: 'Mão de 11 (mão de ferro)',
        text: 'A dupla que chega a 11 olha as próprias cartas e decide se joga a mão valendo 3. Se desistir, o adversário marca 1 tento.',
      },
    ],
  },
];

export const FOOTNOTE = 'Este app conta os tentos — não distribui cartas nem joga a partida.';
