import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';

import { MAX_NAME_LENGTH } from '../engine';
import { DEFAULT_TEAM_1, DEFAULT_TEAM_2 } from '../model/scoreState';
import { GAMES_TO_WIN_OPTIONS } from '../model/seriesState';

interface Props {
  isOpen: boolean;
  initialTeam1: string;
  initialTeam2: string;
  initialGamesToWin: number;
  onCancel: () => void;
  onStart: (team1: string, team2: string, gamesToWin: number) => void;
}

interface FormProps extends Omit<Props, 'isOpen'> {
  onCancel: () => void;
}

/** O formulário só existe enquanto o modal está aberto, então ele sempre abre com os valores atuais. */
const Form: React.FC<FormProps> = ({ initialTeam1, initialTeam2, initialGamesToWin, onCancel, onStart }) => {
  const [name1, setName1] = useState(initialTeam1);
  const [name2, setName2] = useState(initialTeam2);
  const [gamesToWin, setGamesToWin] = useState(initialGamesToWin);
  const single = gamesToWin === 1;

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{single ? 'Nova partida' : 'Nova série'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onCancel}>Cancelar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="page-column">
          <p className="body-text">Defina as duplas e o formato da série.</p>

          <IonInput
            label="Nome da sua dupla"
            labelPlacement="stacked"
            fill="outline"
            value={name1}
            placeholder={DEFAULT_TEAM_1}
            maxlength={MAX_NAME_LENGTH}
            counter
            onIonInput={(e) => setName1(String(e.detail.value ?? ''))}
          />
          <div className="spacer" />
          <IonInput
            label="Nome dos adversários"
            labelPlacement="stacked"
            fill="outline"
            value={name2}
            placeholder={DEFAULT_TEAM_2}
            maxlength={MAX_NAME_LENGTH}
            counter
            onIonInput={(e) => setName2(String(e.detail.value ?? ''))}
          />

          <h3 className="section-title">Partidas para vencer a série</h3>
          <IonSegment
            value={String(gamesToWin)}
            onIonChange={(e) => {
              const v = Number(e.detail.value);
              if (GAMES_TO_WIN_OPTIONS.some((o) => o === v)) setGamesToWin(v);
            }}
          >
            {GAMES_TO_WIN_OPTIONS.map((v) => (
              <IonSegmentButton
                key={v}
                value={String(v)}
                aria-label={v === 1 ? 'Partida única' : `Vence a série quem ganhar ${v} partidas`}
              >
                <IonLabel>{v === 1 ? 'Única' : v}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
          <p className="muted">
            {single
              ? 'Partida única: uma partida de 12 tentos e acabou.'
              : `A série termina quando uma dupla vence ${gamesToWin} partidas. Cada partida vai até 12 tentos.`}
          </p>
          <p className="muted">
            Variante: Truco Paulista, Goiano ou Mineiro — o placar é o mesmo. Veja os resumos na aba Regras.
          </p>

          <IonButton
            expand="block"
            size="large"
            shape="round"
            color="primary"
            onClick={() => onStart(name1, name2, gamesToWin)}
          >
            {single ? 'Começar partida' : 'Começar série'}
          </IonButton>
        </div>
      </IonContent>
    </>
  );
};

const NewSeriesModal: React.FC<Props> = ({ isOpen, ...rest }) => (
  <IonModal isOpen={isOpen} onDidDismiss={rest.onCancel}>
    {isOpen && <Form {...rest} />}
  </IonModal>
);

export default NewSeriesModal;
