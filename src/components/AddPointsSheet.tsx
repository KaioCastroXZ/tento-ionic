import { IonActionSheet, IonAlert } from '@ionic/react';
import { useRef, useState } from 'react';

import { HAND_VALUES, WINNING_SCORE } from '../model/truco';

import { escapeHtml } from './escapeHtml';

interface Props {
  /** Dupla escolhida (null = fechado). */
  teamName: string | null;
  currentScore: number;
  onClose: () => void;
  onConfirmValue: (value: number) => void;
}

const plural = (v: number) => (v === 1 ? 'Adicionar um tento' : `Adicionar ${v} tentos`);

/**
 * Menu rápido +1 +3 +6 +9 +12. Se o valor passaria de 12, pede confirmação
 * (o placar é limitado a 12). A confirmação só abre DEPOIS que o menu terminou de fechar.
 */
const AddPointsSheet: React.FC<Props> = ({ teamName, currentScore, onClose, onConfirmValue }) => {
  const chosen = useRef<number | null>(null);
  const [overflow, setOverflow] = useState<{ name: string; score: number; value: number } | null>(null);

  const handleSheetDismiss = () => {
    const value = chosen.current;
    chosen.current = null;
    if (value !== null && teamName !== null) {
      if (currentScore + value > WINNING_SCORE) setOverflow({ name: teamName, score: currentScore, value });
      else onConfirmValue(value);
    }
    onClose();
  };

  return (
    <>
      <IonActionSheet
        isOpen={teamName !== null}
        header="Adicionar tentos"
        subHeader={`${teamName ?? ''} • ${currentScore} / ${WINNING_SCORE}`}
        buttons={[
          ...HAND_VALUES.map((v) => ({
            text: `+${v}`,
            htmlAttributes: { 'aria-label': `${plural(v)} para ${teamName ?? ''}` },
            handler: () => {
              chosen.current = v;
            },
          })),
          { text: 'Cancelar', role: 'cancel' },
        ]}
        onDidDismiss={handleSheetDismiss}
      />
      <IonAlert
        isOpen={overflow !== null}
        header={`Passa de ${WINNING_SCORE}`}
        message={
          overflow
            ? `${escapeHtml(overflow.name)} está com ${overflow.score}. Adicionar +${overflow.value} ultrapassaria ${WINNING_SCORE}. O placar será limitado a ${WINNING_SCORE}. Continuar?`
            : ''
        }
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: `Aplicar (${WINNING_SCORE})`,
            role: 'confirm',
            handler: () => {
              if (overflow) onConfirmValue(overflow.value);
            },
          },
        ]}
        onDidDismiss={() => setOverflow(null)}
      />
    </>
  );
};

export default AddPointsSheet;
