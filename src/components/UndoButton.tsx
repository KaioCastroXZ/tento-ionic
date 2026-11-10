import { IonButton, IonIcon } from '@ionic/react';
import { arrowUndoOutline } from 'ionicons/icons';

import { useScore } from '../hooks/useScore';
import { isFinished } from '../model/scoreState';
import { canUndo } from '../model/seriesState';

/** "Desfazer" — usado no Placar e no Histórico. */
const UndoButton: React.FC = () => {
  const { series, undoLastAction } = useScore();
  const reopens =
    series.currentGame.history.length === 0 && series.completedGames.length > 0 && !isFinished(series.currentGame);
  return (
    <IonButton
      className="undo-btn"
      expand="block"
      fill="outline"
      shape="round"
      disabled={!canUndo(series)}
      aria-label={reopens ? 'Desfazer: reabrir a última partida encerrada' : 'Desfazer o último lançamento'}
      onClick={undoLastAction}
    >
      <IonIcon slot="start" icon={arrowUndoOutline} aria-hidden="true" />
      Desfazer
    </IonButton>
  );
};

export default UndoButton;
