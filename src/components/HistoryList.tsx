import { useScore } from '../hooks/useScore';
import { gameScoreOf } from '../model/gameResult';
import type { ScoreEvent } from '../model/scoreEvent';
import { nameOf } from '../model/scoreState';
import { seriesNameOf } from '../model/seriesState';
import { TEAM_ONE } from '../model/truco';
import { useTeamColors } from '../theme/teamColors';

const Event: React.FC<{ index: number; event: ScoreEvent; name: string }> = ({ index, event, name }) => {
  const { onCard } = useTeamColors(event.team);
  const sign = event.points > 0 ? `+${event.points}` : `−${Math.abs(event.points)}`;
  const unit = Math.abs(event.points) === 1 ? 'tento' : 'tentos';
  return (
    <li className="history__row" aria-label={`Lançamento ${index}: ${name} ${sign} ${unit}`}>
      <span className="history__num">{index}.</span>
      <span className="history__name">{name}</span>
      <span className="history__delta" style={{ color: onCard }}>
        {sign}
      </span>
    </li>
  );
};

/** Partidas da série + lançamentos da partida atual. */
const HistoryList: React.FC = () => {
  const { series } = useScore();
  const events = series.currentGame.history;
  return (
    <div className="history">
      {series.completedGames.length > 0 && (
        <>
          <h3 className="section-title">Partidas da série</h3>
          <ul className="history__list">
            {series.completedGames.map((g, i) => {
              const winnerName = seriesNameOf(series, g.winner);
              return (
                <li
                  key={`${g.timestamp}-${i}`}
                  className="history__row"
                  aria-label={`Partida ${i + 1}: ${g.team1Score} a ${g.team2Score}, venceu ${winnerName}`}
                >
                  <span className="history__num history__num--game">P{i + 1}</span>
                  <span className="history__score">
                    {gameScoreOf(g, TEAM_ONE)} × {g.team2Score}
                  </span>
                  <span className="history__name">· {winnerName}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h3 className="section-title">Lançamentos da partida atual</h3>
      {events.length === 0 ? (
        <p className="muted">Nenhum lançamento nesta partida ainda.</p>
      ) : (
        <ul className="history__list">
          {events.map((e, i) => (
            <Event key={`${e.timestamp}-${i}`} index={i + 1} event={e} name={nameOf(series.currentGame, e.team)} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList;
