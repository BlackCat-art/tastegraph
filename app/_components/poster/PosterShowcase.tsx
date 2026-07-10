import PosterTemplate from "./PosterTemplate";

export function PosterShowcase() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold text-fg">Poster Showcase — 9 Combinations</h2>
      <p className="text-sm text-fgmute">3 templates × 3 aspect ratios (default font + default palette per template)</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Row 1: Editorial × 3 ratios — 3 different mocks (orange / green / blue) */}
        <PosterTemplate
          kind="editorial"
          accent="#E5681A"
          aspectRatio="1:1"
          personalityLabel="The Centerpiece"
          personalityOneLiner="Equidistant from every genre."
          summary="Balanced taste."
          scores={{ decadeSpread: 50, genreBalance: 50, mainstreamScore: 50, moodSpectrum: 50, discoveryIndex: 50 }}
          playlistTitle="Mixed Tape Vol. 1"
          trackCount={47}
        />
        <PosterTemplate
          kind="editorial"
          accent="#6B7F3A"
          aspectRatio="3:4"
          personalityLabel="Mainstream Sunshine"
          personalityOneLiner="You know every hit."
          summary="Drawn to top 40."
          scores={{ decadeSpread: 30, genreBalance: 20, mainstreamScore: 90, moodSpectrum: 60, discoveryIndex: 15 }}
          playlistTitle="Top Hits 2025"
          trackCount={50}
        />
        <PosterTemplate
          kind="editorial"
          accent="#2C5F8D"
          aspectRatio="9:16"
          personalityLabel="Late Night Explorer"
          personalityOneLiner="You live in 2014 and cry to synthesizers."
          summary="A nostalgic soul."
          scores={{ decadeSpread: 80, genreBalance: 90, mainstreamScore: 15, moodSpectrum: 40, discoveryIndex: 95 }}
          playlistTitle="Midnight Drift"
          trackCount={32}
        />

        {/* Row 2: Modernist × 3 ratios — same mock, 3 ratios, red accent, default mono font */}
        <PosterTemplate
          kind="modernist"
          accent="#E63946"
          aspectRatio="1:1"
          personalityLabel="Data Driven"
          personalityOneLiner="Numbers don't lie."
          summary="Pure analytics mode."
          scores={{ decadeSpread: 70, genreBalance: 40, mainstreamScore: 55, moodSpectrum: 65, discoveryIndex: 80 }}
          playlistTitle="Analytics Vol. 1"
          trackCount={42}
        />
        <PosterTemplate
          kind="modernist"
          accent="#E63946"
          aspectRatio="3:4"
          personalityLabel="Data Driven"
          personalityOneLiner="Numbers don't lie."
          summary="Pure analytics mode."
          scores={{ decadeSpread: 70, genreBalance: 40, mainstreamScore: 55, moodSpectrum: 65, discoveryIndex: 80 }}
          playlistTitle="Analytics Vol. 1"
          trackCount={42}
        />
        <PosterTemplate
          kind="modernist"
          accent="#E63946"
          aspectRatio="9:16"
          personalityLabel="Data Driven"
          personalityOneLiner="Numbers don't lie."
          summary="Pure analytics mode."
          scores={{ decadeSpread: 70, genreBalance: 40, mainstreamScore: 55, moodSpectrum: 65, discoveryIndex: 80 }}
          playlistTitle="Analytics Vol. 1"
          trackCount={42}
        />

        {/* Row 3: Risograph × 3 ratios — same mock, 3 ratios, blue-red palette */}
        <PosterTemplate
          kind="risograph"
          accent="#2C5F8D"
          accent2="#D24B27"
          aspectRatio="1:1"
          personalityLabel="Indie Romance"
          personalityOneLiner="Print is dead, long live print."
          summary="Risograph revival."
          scores={{ decadeSpread: 60, genreBalance: 75, mainstreamScore: 25, moodSpectrum: 70, discoveryIndex: 85 }}
          playlistTitle="Riso Cuts"
          trackCount={28}
        />
        <PosterTemplate
          kind="risograph"
          accent="#2C5F8D"
          accent2="#D24B27"
          aspectRatio="3:4"
          personalityLabel="Indie Romance"
          personalityOneLiner="Print is dead, long live print."
          summary="Risograph revival."
          scores={{ decadeSpread: 60, genreBalance: 75, mainstreamScore: 25, moodSpectrum: 70, discoveryIndex: 85 }}
          playlistTitle="Riso Cuts"
          trackCount={28}
        />
        <PosterTemplate
          kind="risograph"
          accent="#2C5F8D"
          accent2="#D24B27"
          aspectRatio="9:16"
          personalityLabel="Indie Romance"
          personalityOneLiner="Print is dead, long live print."
          summary="Risograph revival."
          scores={{ decadeSpread: 60, genreBalance: 75, mainstreamScore: 25, moodSpectrum: 70, discoveryIndex: 85 }}
          playlistTitle="Riso Cuts"
          trackCount={28}
        />
      </div>
    </div>
  );
}
