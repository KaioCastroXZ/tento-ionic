import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';

import {
  COMMON,
  FOOTNOTE,
  HAND_TABLE,
  HOW_TO_PLAY,
  INTRO,
  VARIANTS,
  type RuleItem,
  type VariantId,
} from '../data/rulesContent';

const Items: React.FC<{ items: readonly RuleItem[] }> = ({ items }) => (
  <>
    {items.map((it, i) => (
      <div key={i} className="rule">
        {it.label && <h4 className="rule__label">{it.label}</h4>}
        <p className="body-text rule__text">{it.text}</p>
      </div>
    ))}
  </>
);

const Section: React.FC<{ value: string; title: string; children: React.ReactNode }> = ({ value, title, children }) => (
  <IonAccordion value={value}>
    <IonItem slot="header">
      <IonLabel>{title}</IonLabel>
    </IonItem>
    <div slot="content" className="accordion-content">
      {children}
    </div>
  </IonAccordion>
);

const Regras: React.FC = () => {
  const [variantId, setVariantId] = useState<VariantId>('paulista');
  const variant = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Regras do Truco</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-column">
          <IonAccordionGroup multiple value={['how']}>
            <Section value="how" title="Como jogar">
              <h4 className="rule__label">O essencial</h4>
              <p className="body-text">{HOW_TO_PLAY.essential}</p>
              <dl className="hand-table">
                {HAND_TABLE.map(([label, value]) => (
                  <div key={label} className="hand-table__row">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <h4 className="rule__label">Série (melhor de N)</h4>
              {HOW_TO_PLAY.series.map((t) => (
                <p key={t} className="body-text">
                  {t}
                </p>
              ))}
              <h4 className="rule__label">Marcando no app</h4>
              {HOW_TO_PLAY.usage.map((t) => (
                <p key={t} className="body-text">
                  {t}
                </p>
              ))}
            </Section>
            <Section value="intro" title="Antes de tudo">
              {INTRO.map((t) => (
                <p key={t} className="body-text">
                  {t}
                </p>
              ))}
            </Section>
            <Section value="common" title="Comum às três variantes">
              <Items items={COMMON} />
            </Section>
          </IonAccordionGroup>

          <h3 className="section-title">Variantes</h3>
          <IonSegment
            value={variantId}
            onIonChange={(e) => setVariantId(VARIANTS.find((v) => v.id === e.detail.value)?.id ?? 'paulista')}
          >
            {VARIANTS.map((v) => (
              <IonSegmentButton key={v.id} value={v.id}>
                <IonLabel>{v.title.replace('Truco ', '')}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
          <div className="card">
            <h3 className="card__title">{variant.title}</h3>
            <Items items={variant.items} />
          </div>

          <p className="muted">{FOOTNOTE}</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Regras;
