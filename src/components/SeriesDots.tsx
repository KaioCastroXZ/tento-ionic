interface Props {
  teamName: string;
  gamesWon: number;
  gamesToWin: number;
  accent: string;
  onAccent: string;
}

/** "PARTIDAS x/N" com bolinhas; as vencidas levam um ✓ (não depende só de cor). */
const SeriesDots: React.FC<Props> = ({ teamName, gamesWon, gamesToWin, accent, onAccent }) => (
  <div
    className="series-dots"
    role="img"
    aria-label={`${teamName} venceu ${gamesWon} de ${gamesToWin} partidas da série`}
  >
    <span className="series-dots__label">
      PARTIDAS {gamesWon}/{gamesToWin}
    </span>
    <span className="series-dots__row">
      {Array.from({ length: gamesToWin }, (_, i) => {
        const filled = i < gamesWon;
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <circle cx="6" cy="6" r="6" fill={accent} opacity={filled ? 1 : 0.2} />
            {filled && (
              <path
                d="M3.4 6.3 5.2 8.1 8.7 4.2"
                fill="none"
                stroke={onAccent}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        );
      })}
    </span>
  </div>
);

export default SeriesDots;
