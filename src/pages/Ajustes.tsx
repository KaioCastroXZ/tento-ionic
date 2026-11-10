import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';

import { useScore } from '../hooks/useScore';
import { THEME_MODES, type ThemeMode } from '../model/settingsState';

const THEME_LABELS: Record<ThemeMode, string> = { system: 'Sistema', light: 'Claro', dark: 'Escuro' };

const Ajustes: React.FC = () => {
  const { settings, setThemeMode, setHaptics, setSound, resetAllData } = useScore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-column">
          <h3 className="section-title">Tema</h3>
          <IonSegment
            value={settings.themeMode}
            onIonChange={(e) => {
              const mode = THEME_MODES.find((m) => m === e.detail.value);
              if (mode) setThemeMode(mode);
            }}
          >
            {THEME_MODES.map((m) => (
              <IonSegmentButton key={m} value={m}>
                <IonLabel>{THEME_LABELS[m]}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <h3 className="section-title">Feedback</h3>
          <IonList inset={false} lines="full" className="settings-list">
            <IonItem>
              <IonToggle checked={settings.hapticsEnabled} onIonChange={(e) => setHaptics(e.detail.checked)}>
                <IonLabel>Vibração</IonLabel>
                <p className="muted">Vibra levemente ao marcar tentos.</p>
              </IonToggle>
            </IonItem>
            <IonItem>
              <IonToggle checked={settings.soundEnabled} onIonChange={(e) => setSound(e.detail.checked)}>
                <IonLabel>Sons</IonLabel>
                <p className="muted">Toca um clique curto ao marcar tentos.</p>
              </IonToggle>
            </IonItem>
          </IonList>

          <h3 className="section-title">Dados</h3>
          <p className="body-text">Apaga o placar atual, o histórico e as preferências.</p>
          <IonButton expand="block" shape="round" color="danger" onClick={() => setConfirmOpen(true)}>
            Resetar dados
          </IonButton>

          <h3 className="section-title">Sobre</h3>
          <p className="body-text">Tento — Placar de Truco</p>
          <p className="body-text">Versão 1.0</p>
          <p className="muted">
            Um contador de tentos para partidas presenciais de Truco. Funciona offline, sem cadastro e sem anúncios.
          </p>
        </div>

        <IonAlert
          isOpen={confirmOpen}
          header="Resetar dados?"
          message="Placar, histórico e preferências voltam ao padrão. Não dá para desfazer."
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Resetar', role: 'destructive', handler: () => void resetAllData() },
          ]}
          onDidDismiss={() => setConfirmOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Ajustes;
