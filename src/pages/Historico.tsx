import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import HistoryList from '../components/HistoryList';
import UndoButton from '../components/UndoButton';
import { useScore } from '../hooks/useScore';

const Historico: React.FC = () => {
  const { active } = useScore();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Histórico</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-column">
          {active ? (
            <>
              <HistoryList />
              <UndoButton />
            </>
          ) : (
            <p className="muted">Nenhuma série em andamento. Comece uma na aba Placar.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Historico;
