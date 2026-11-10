import { IonIcon } from '@ionic/react';
import { addOutline, createOutline, removeOutline } from 'ionicons/icons';
import type { CSSProperties } from 'react';

import { WINNING_SCORE, type Team } from '../model/truco';
import { useTeamColors } from '../theme/teamColors';

import SeriesDots from './SeriesDots';

interface Props {
  team: Team;
  name: string;
  score: number;
  gamesWon: number;
  gamesToWin: number;
  /** Destaca a dupla vencedora da série. */
  isSeriesWinner: boolean;
  canRemove: boolean;
  canAdd: boolean;
  onQuickAdd: () => void;
  onIncrement: () => void;
  onTruco: () => void;
  onDecrement: () => void;
  onEditName: () => void;
}

const TeamPanel: React.FC<Props> = ({
  team,
  name,
  score,
  gamesWon,
  gamesToWin,
  isSeriesWinner,
  canRemove,
  canAdd,
  onQuickAdd,
  onIncrement,
  onTruco,
  onDecrement,
  onEditName,
}) => {
  const { accent, onAccent, onCard } = useTeamColors(team);
  const nearEnd = score >= WINNING_SCORE - 1;
  const style = { '--accent': accent, '--on-accent': onAccent, '--on-card': onCard } as CSSProperties;

  return (
    <section className={`team-panel${isSeriesWinner ? ' team-panel--winner' : ''}`} style={style} aria-label={name}>
      <div className="team-panel__stripe" />
      <div className="team-panel__body">
        <header className="team-panel__head">
          <h2 className="team-panel__name">{name}</h2>
          <button type="button" className="icon-btn" aria-label={`Editar o nome de ${name}`} onClick={onEditName}>
            <IonIcon icon={createOutline} aria-hidden="true" />
          </button>
        </header>

        {gamesToWin > 1 && (
          <SeriesDots teamName={name} gamesWon={gamesWon} gamesToWin={gamesToWin} accent={accent} onAccent={onAccent} />
        )}

        <button
          type="button"
          className="team-panel__score-btn"
          onClick={onQuickAdd}
          disabled={!canAdd}
          aria-label={`${name} tem ${score} de ${WINNING_SCORE} tentos. Toque para adicionar tentos.`}
        >
          {/* key={score}: remonta o número e dispara o "pulso" de escala a cada mudança */}
          <span key={score} className="team-panel__score">
            {score}
          </span>
        </button>

        <div className="progress" aria-hidden="true">
          <div className="progress__bar">
            <div className="progress__fill" style={{ width: `${(score / WINNING_SCORE) * 100}%` }} />
          </div>
          <span className={`progress__label${nearEnd ? ' progress__label--strong' : ''}`}>
            {score} / {WINNING_SCORE} tentos
          </span>
        </div>

        <div className="team-panel__row">
          <button
            type="button"
            className="round-btn round-btn--outline"
            aria-label={`Remover um tento de ${name}`}
            onClick={onDecrement}
            disabled={!canRemove}
          >
            <IonIcon icon={removeOutline} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="round-btn round-btn--add"
            aria-label={`Adicionar um tento para ${name}`}
            onClick={onIncrement}
            disabled={!canAdd}
          >
            <IonIcon icon={addOutline} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="truco-btn"
          aria-label={`Truco: adicionar três tentos para ${name}`}
          onClick={onTruco}
          disabled={!canAdd}
        >
          TRUCO · +3
        </button>
      </div>
    </section>
  );
};

export default TeamPanel;
