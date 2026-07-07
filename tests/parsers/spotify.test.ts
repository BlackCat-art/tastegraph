import { describe, it, expect } from "vitest";
import { extractSpotifyPlaylistId } from "@/lib/parsers/spotify";

describe("extractSpotifyPlaylistId", () => {
  it.each([
    ["https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", "37i9dQZF1DXcBWIGoYBM5M"],
    ["https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123", "37i9dQZF1DXcBWIGoYBM5M"],
    ["http://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", "37i9dQZF1DXcBWIGoYBM5M"],
    ["open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", "37i9dQZF1DXcBWIGoYBM5M"],
    ["spotify:playlist:37i9dQZF1DXcBWIGoYBM5M", "37i9dQZF1DXcBWIGoYBM5M"],
    ["37i9dQZF1DXcBWIGoYBM5M", "37i9dQZF1DXcBWIGoYBM5M"],
  ])("extracts %s", (input, expected) => {
    expect(extractSpotifyPlaylistId(input)).toBe(expected);
  });

  it.each([
    "",
    "https://example.com/foo",
    "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",  // track, not playlist
    "https://open.spotify.com/album/1DFixLWuPkw3WSB61Y9P3T",   // album
    "spotify:user:foo",
  ])("rejects %s", (input) => {
    expect(extractSpotifyPlaylistId(input)).toBeNull();
  });
});
