import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import { FaMusic, FaGuitar, FaMicrophone, FaDrum, FaCompactDisc } from "react-icons/fa";

const GENRE_ICONS = {
  "Pop": <FaMicrophone />,
  "Rock": <FaGuitar />,
  "Jazz": <FaDrum />,
  "Electronic": <FaCompactDisc />,
  "Classical": <FaMusic />,
};

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      // Mock data - replace with actual API call
      setGenres([
        { id: 1, name: "Pop", songCount: 1250, trending: true, description: "Popular music genre" },
        { id: 2, name: "Rock", songCount: 890, trending: false, description: "Rock and roll music" },
        { id: 3, name: "Jazz", songCount: 456, trending: true, description: "Jazz and blues" },
        { id: 4, name: "Electronic", songCount: 2100, trending: true, description: "Electronic dance music" },
        { id: 5, name: "Classical", songCount: 678, trending: false, description: "Classical music" },
        { id: 6, name: "Hip Hop", songCount: 1450, trending: true, description: "Hip hop and rap" },
        { id: 7, name: "R&B", songCount: 820, trending: false, description: "Rhythm and blues" },
        { id: 8, name: "Country", songCount: 560, trending: false, description: "Country music" },
      ]);
    } catch (error) {
      console.error("Failed to load genres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    // Load songs for this genre
    // Mock data
    setSongs([
      { id: 1, title: `${genre.name} Song 1`, artist: "Artist Name", plays: 125000 },
      { id: 2, title: `${genre.name} Song 2`, artist: "Artist Name", plays: 98000 },
    ]);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="genres-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold" style={{ color: "var(--text-color)" }}>
            Music Genres
          </h1>
        </div>

        {/* Trending Genres */}
        <div className="mb-5">
          <h3 className="mb-3" style={{ color: "var(--text-color)" }}>Trending Now</h3>
          <div className="row g-3">
            {genres.filter(g => g.trending).map((genre) => (
              <div key={genre.id} className="col-md-3 col-sm-6">
                <div
                  className="card p-4 text-center"
                  style={{
                    cursor: "pointer",
                    background: selectedGenre?.id === genre.id 
                      ? "var(--primary-gradient)" 
                      : "var(--card-color)",
                    color: selectedGenre?.id === genre.id ? "white" : "var(--text-color)",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleGenreClick(genre)}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    {GENRE_ICONS[genre.name] || <FaMusic />}
                  </div>
                  <h4 className="mb-2">{genre.name}</h4>
                  <p className="small mb-0 opacity-75">{genre.songCount.toLocaleString()} songs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Genres */}
        <div className="mb-5">
          <h3 className="mb-3" style={{ color: "var(--text-color)" }}>All Genres</h3>
          <div className="row g-3">
            {genres.map((genre) => (
              <div key={genre.id} className="col-md-4 col-sm-6">
                <div
                  className="card p-3 d-flex flex-row align-items-center"
                  style={{
                    cursor: "pointer",
                    background: selectedGenre?.id === genre.id 
                      ? "var(--primary-light)" 
                      : "var(--card-color)",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleGenreClick(genre)}
                >
                  <div style={{ fontSize: 32, marginRight: 16, color: "var(--primary-color)" }}>
                    {GENRE_ICONS[genre.name] || <FaMusic />}
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-0" style={{ color: "var(--text-color)" }}>{genre.name}</h5>
                    <small style={{ color: "var(--text-muted)" }}>
                      {genre.songCount.toLocaleString()} songs
                    </small>
                  </div>
                  {genre.trending && (
                    <span className="badge bg-danger">Trending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Genre Songs */}
        {selectedGenre && (
          <div className="mb-5">
            <h3 className="mb-3" style={{ color: "var(--text-color)" }}>
              Popular in {selectedGenre.name}
            </h3>
            <div className="list-group">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className="list-group-item d-flex align-items-center"
                  style={{
                    background: "var(--card-color)",
                    border: "1px solid var(--border-color)",
                    marginBottom: 8,
                  }}
                >
                  <span className="me-3 fw-bold" style={{ color: "var(--text-muted)", width: 30 }}>
                    {index + 1}
                  </span>
                  <div className="flex-grow-1">
                    <h6 className="mb-0" style={{ color: "var(--text-color)" }}>{song.title}</h6>
                    <small style={{ color: "var(--text-muted)" }}>{song.artist}</small>
                  </div>
                  <div className="text-end">
                    <small style={{ color: "var(--text-muted)" }}>
                      {song.plays.toLocaleString()} plays
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
