import PosterTemplate from "./PosterTemplate";

export function PosterShowcase() {
  return (
    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3">
      <PosterTemplate
        kind="editorial"
        accent="#E5681A"
        personalityLabel="The Centerpiece"
        personalityOneLiner="Equidistant from every genre."
        summary="Balanced taste, evenly spread."
        scores={{ decadeSpread: 50, genreBalance: 50, mainstreamScore: 50, moodSpectrum: 50, discoveryIndex: 50 }}
        playlistTitle="Mixed Tape Vol. 1"
        trackCount={47}
      />
      <PosterTemplate
        kind="editorial"
        accent="#6B7F3A"
        personalityLabel="Mainstream Sunshine"
        personalityOneLiner="You know every hit, and you're proud."
        summary="Drawn to top 40."
        scores={{ decadeSpread: 30, genreBalance: 20, mainstreamScore: 90, moodSpectrum: 60, discoveryIndex: 15 }}
        playlistTitle="Top Hits 2025"
        trackCount={50}
      />
      <PosterTemplate
        kind="editorial"
        accent="#2C5F8D"
        personalityLabel="Late Night Explorer"
        personalityOneLiner="You live in 2014 and cry to synthesizers."
        summary="A nostalgic soul with eclectic taste."
        scores={{ decadeSpread: 80, genreBalance: 90, mainstreamScore: 15, moodSpectrum: 40, discoveryIndex: 95 }}
        playlistTitle="Midnight Drift"
        trackCount={32}
      />
    </div>
  );
}
