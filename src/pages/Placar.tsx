import {
  IonActionSheet,
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { ellipsisVertical } from 'ionicons/icons';
import { useMemo, useRef, useState } from 'react';

import AddPointsSheet from '../components/AddPointsSheet';
import NewSeriesModal from '../components/NewSeriesModal';
import TeamPanel from '../components/TeamPanel';
import UndoButton from '../components/UndoButton';
import { escapeHtml } from '../components/escapeHtml';
import { MAX_NAME_LENGTH } from '../engine';
import { useFeedback } from '../hooks/useFeedback';
import { useScore } from '../hooks/useScore';
import {
  boardScoreOf,
  currentGameNumber,
  gamesOf,
  isAwaitingAdvance,
  isSeriesFinished,
  isSingleGame,
  lastGame,
  seriesNameOf,
  seriesWinner,
  team1Games,
  team2Games,
  type SeriesState,
} from '../model/seriesState';
import { TEAM_ONE, TEAM_TWO, WINNING_SCORE, type Team } from '../model/truco';

const TEAMS: readonly Team[] = [TEAM_ONE, TEAM_TWO];

const statusText = (series: SeriesState): string => {
  const g = series.currentGame;
  const leader =
    g.team1Score === g.team2Score
      ? `Empate em ${g.team1Score} / ${WINNING_SCORE}`
      : g.team1Score > g.team2Score
        ? `${g.team1Name} na frente: ${g.team1Score} / ${WINNING_SCORE}`
        : `${g.team2Name} na frente: ${g.team2Score} / ${WINNING_SCORE}`;
  const sw = seriesWinner(series);
  if (sw !== null) return `${seriesNameOf(series, sw)} venceu a série (${team1Games(series)} x ${team2Games(series)})`;
  if (isSingleGame(series)) return leader;
  return `Série ${team1Games(series)} x ${team2Games(series)} · partida ${currentGameNumber(series)} — ${leader}`;
};

const Placar: React.FC = () => {
  const ctx = useScore();
  const { series, active, settings } = ctx;
  const feedback = useFeedback(settings);

  const [newSeriesOpen, setNewSeriesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [quickAddTeam, setQuickAddTeam] = useState<Team | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  // Timestamp da partida cujo alerta de fim foi adiado (para abrir "Nova série" sem o alerta por cima).
  const [gameOverHiddenFor, setGameOverHiddenFor] = useState<number | null>(null);

  const add = (team: Team, points: number) => {
    ctx.addPoints(team, points);
    feedback();
  };

  const awaiting = isAwaitingAdvance(series);
  const finishedSeries = isSeriesFinished(series);
  const last = lastGame(series);
  const showGameOver = awaiting && last !== null && gameOverHiddenFor !== last.timestamp;
  const locked = awaiting || finishedSeries;
  const single = isSingleGame(series);

  const gameOver = (() => {
    if (!awaiting || !last) return null;
    const gameScore = `${last.team1Score} x ${last.team2Score}`;
    const winnerName = escapeHtml(seriesNameOf(series, last.winner));
    const t1 = team1Games(series);
    const t2 = team2Games(series);
    if (finishedSeries) {
      const sw = escapeHtml(seriesNameOf(series, seriesWinner(series) ?? TEAM_ONE));
      return single
        ? { header: '🏆 Fim de jogo', message: `${winnerName} venceu!\n${gameScore}`, next: 'Nova partida' }
        : {
            header: '🏆 Fim da série',
            message: `${sw} venceu a série!\nPartidas: ${t1} x ${t2}\nÚltima partida: ${gameScore}`,
            next: 'Nova série',
          };
    }
    const done = series.completedGames.length;
    return {
      header: `Partida ${done} encerrada`,
      message: `${winnerName} venceu ${gameScore}.\nSérie: ${t1} x ${t2} — próxima é a partida ${done + 1}.`,
      next: 'Próxima partida',
    };
  })();

  // Overlays em sequência: o seguinte só abre quando o anterior terminou de fechar. Abrir de dentro do
  // handler deixa `aria-hidden` preso no app inteiro (invisível para leitores de tela).
  const afterDismiss = useRef<(() => void) | null>(null);
  const runAfterDismiss = () => {
    const next = afterDismiss.current;
    afterDismiss.current = null;
    next?.();
  };

  const openNewSeries = () => {
    if (last) setGameOverHiddenFor(last.timestamp);
    setNewSeriesOpen(true);
  };

  // Array estável: se a identidade mudar a cada render, o Ionic reinicia o campo e perde o que foi digitado.
  const editName = editTeam === null ? '' : seriesNameOf(series, editTeam);
  // O texto digitado fica num ref (via attributes.onInput), sem depender do valor que o alerta devolve ao salvar.
  const draftName = useRef('');
  const editInputs = useMemo(
    () => [
      {
        name: 'name',
        type: 'text' as const,
        value: editName,
        attributes: {
          maxlength: MAX_NAME_LENGTH,
          'aria-label': 'Nome da dupla',
          onInput: (e: Event) => {
            draftName.current = (e.target as HTMLInputElement).value;
          },
        },
      },
    ],
    [editName],
  );
  const openEdit = (team: Team) => {
    draftName.current = seriesNameOf(series, team);
    setEditTeam(team);
  };

  const quickTeamName = quickAddTeam === null ? null : seriesNameOf(series, quickAddTeam);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <span className="brand">TENTO</span>
            {active && (
              <span className="brand-sub">
                {single ? 'Placar de Truco' : `Série até ${series.gamesToWin} partidas`}
              </span>
            )}
          </IonTitle>
          {active && (
            <IonButtons slot="end">
              <IonButton aria-label="Mais opções" onClick={() => setMenuOpen(true)}>
                <IonIcon slot="icon-only" icon={ellipsisVertical} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {!active ? (
          <div className="start">
            <h1 className="start__brand">TENTO</h1>
            <p className="start__title">Placar de Truco</p>
            <p className="start__tagline">Rápido, bonito e feito para marcar com uma mão só.</p>
            <IonButton
              className="start__cta"
              expand="block"
              size="large"
              shape="round"
              color="primary"
              onClick={() => setNewSeriesOpen(true)}
            >
              Nova partida
            </IonButton>
          </div>
        ) : (
          <div className="board">
            <div className="board__teams">
              {TEAMS.map((team) => (
                <TeamPanel
                  key={team}
                  team={team}
                  name={seriesNameOf(series, team)}
                  score={boardScoreOf(series, team)}
                  gamesWon={gamesOf(series, team)}
                  gamesToWin={series.gamesToWin}
                  isSeriesWinner={finishedSeries && seriesWinner(series) === team}
                  canAdd={!locked}
                  // Corrigir com − só quando a partida não está fechada: com 12 à vista o engine
                  // (idêntico ao Kotlin) deixaria o resultado registrado e contaria a partida em dobro.
                  canRemove={!locked && boardScoreOf(series, team) > 0}
                  onQuickAdd={() => setQuickAddTeam(team)}
                  onIncrement={() => add(team, 1)}
                  onTruco={() => add(team, 3)}
                  onDecrement={() => ctx.removePoint(team)}
                  onEditName={() => openEdit(team)}
                />
              ))}
            </div>

            {!finishedSeries && <p className="muted board__hint">toque no número de uma dupla para +6, +9 ou +12</p>}
            <p className="board__status" aria-live="polite">
              {statusText(series)}
            </p>
            <UndoButton />
          </div>
        )}
      </IonContent>

      <NewSeriesModal
        isOpen={newSeriesOpen}
        initialTeam1={series.currentGame.team1Name}
        initialTeam2={series.currentGame.team2Name}
        initialGamesToWin={series.gamesToWin}
        onCancel={() => {
          setNewSeriesOpen(false);
          setGameOverHiddenFor(null);
        }}
        onStart={(n1, n2, g) => {
          ctx.newSeries(n1, n2, g);
          setNewSeriesOpen(false);
          setGameOverHiddenFor(null);
        }}
      />

      <AddPointsSheet
        teamName={quickTeamName}
        currentScore={quickAddTeam === null ? 0 : boardScoreOf(series, quickAddTeam)}
        onClose={() => setQuickAddTeam(null)}
        onConfirmValue={(v) => quickAddTeam !== null && add(quickAddTeam, v)}
      />

      <IonActionSheet
        isOpen={menuOpen}
        header="Opções"
        buttons={[
          {
            text: 'Nova série',
            handler: () => {
              afterDismiss.current = () => setNewSeriesOpen(true);
            },
          },
          {
            text: single ? 'Zerar partida' : 'Zerar série',
            role: 'destructive',
            handler: () => {
              afterDismiss.current = () => setResetOpen(true);
            },
          },
          { text: 'Cancelar', role: 'cancel' },
        ]}
        onDidDismiss={() => {
          setMenuOpen(false);
          runAfterDismiss();
        }}
      />

      <IonAlert
        isOpen={resetOpen}
        header={single ? 'Zerar partida?' : 'Zerar série?'}
        message={
          single
            ? 'Todo o placar e o histórico serão apagados. Os nomes das duplas continuam.'
            : 'Todas as partidas e o histórico da série serão apagados. Os nomes das duplas e o formato continuam.'
        }
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Zerar', role: 'destructive', handler: () => ctx.resetSeries() },
        ]}
        onDidDismiss={() => setResetOpen(false)}
      />

      <IonAlert
        isOpen={editTeam !== null}
        header="Nome da dupla"
        inputs={editInputs}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Salvar',
            role: 'confirm',
            handler: () => {
              if (editTeam !== null) ctx.updateTeamName(editTeam, draftName.current);
            },
          },
        ]}
        onDidDismiss={() => setEditTeam(null)}
      />

      <IonAlert
        isOpen={showGameOver && gameOver !== null}
        cssClass="tento-alert"
        backdropDismiss={false}
        onDidDismiss={runAfterDismiss}
        header={gameOver?.header}
        message={gameOver?.message}
        buttons={[
          {
            text: gameOver?.next ?? '',
            role: 'confirm',
            handler: () => {
              if (finishedSeries) afterDismiss.current = openNewSeries;
              else ctx.startNextGame();
            },
          },
          {
            text: finishedSeries || single ? 'Desfazer' : 'Desfazer partida',
            role: 'cancel',
            handler: () => ctx.undoLastAction(),
          },
        ]}
      />
    </IonPage>
  );
};

export default Placar;
