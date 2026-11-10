import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { bookOutline, settingsOutline, timeOutline, trophyOutline } from 'ionicons/icons';
import { Navigate, Route } from 'react-router-dom';

import { ScoreProvider } from './hooks/ScoreProvider';
import Ajustes from './pages/Ajustes';
import Historico from './pages/Historico';
import Placar from './pages/Placar';
import Regras from './pages/Regras';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Modo escuro por classe: a aba Ajustes liga/desliga `ion-palette-dark` no <html>. */
import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';
import './theme/tento.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <ScoreProvider>
      <IonReactRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/placar" element={<Placar />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/regras" element={<Regras />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/" element={<Navigate to="/placar" replace />} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="placar" href="/placar">
              <IonIcon aria-hidden="true" icon={trophyOutline} />
              <IonLabel>Placar</IonLabel>
            </IonTabButton>
            <IonTabButton tab="historico" href="/historico">
              <IonIcon aria-hidden="true" icon={timeOutline} />
              <IonLabel>Histórico</IonLabel>
            </IonTabButton>
            <IonTabButton tab="regras" href="/regras">
              <IonIcon aria-hidden="true" icon={bookOutline} />
              <IonLabel>Regras</IonLabel>
            </IonTabButton>
            <IonTabButton tab="ajustes" href="/ajustes">
              <IonIcon aria-hidden="true" icon={settingsOutline} />
              <IonLabel>Ajustes</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </ScoreProvider>
  </IonApp>
);

export default App;
