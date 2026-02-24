import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import SongCard from "../components/SongCard";
import { getSongsByGenre } from "../api/songService";
import { getAllGenres } from "../api/genreService";
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
      const data = await getAllGenres();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setGenres(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load genres:", error);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    setLoading(true);
    try {
      const fetchedSongs = await getSongsByGenre(genre.name);
      setSongs(fetchedSongs);
    } catch (error) {
      console.error("Error fetching songs for genre:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedGenre(null);
    setSongs([]);
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

  if (selectedGenre) {
    return (
      <MainLayout>
        <div className="genre-detail-page">
          <button 
            className="btn btn-link text-decoration-none mb-4 ps-0" 
            onClick={handleBack}
            style={{ color: "var(--text-color)", fontSize: "1.1rem" }}
          >
            ← Back to Genres
          </button>
          
          <div className="d-flex align-items-center mb-5 p-5 rounded-4" 
            style={{ 
              background: "var(--primary-gradient)",
              color: "white",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ fontSize: 80, marginRight: 40 }}>
              {GENRE_ICONS[selectedGenre.name] || <FaMusic />}
            </div>
            <div>
              <h1 className="display-4 fw-bold mb-2">{selectedGenre.name}</h1>
              <p className="lead mb-0 opacity-75">{selectedGenre.description}</p>
              <div className="mt-3 badge bg-white text-primary rounded-pill px-3 py-2">
                {selectedGenre.songCount} Songs
              </div>
            </div>
          </div>

          <h3 className="mb-4" style={{ color: "var(--text-color)" }}>Popular in {selectedGenre.name}</h3>
          
          {songs.length > 0 ? (
            <div className="row g-4">
              {songs.map((song) => (
                <div key={song.id} className="col-md-3 col-sm-6">
                  <SongCard song={song} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <FaMusic size={48} className="mb-3 opacity-50" />
              <p>No songs found in this genre yet.</p>
            </div>
          )}
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
          <div id="genre-songs" className="mb-5">
            <h3 className="mb-3" style={{ color: "var(--text-color)" }}>
              Popular in {selectedGenre.name}
            </h3>
            {songs.length > 0 ? (
              <div className="row g-3">
                {songs.map((song) => (
                  <div key={song.id} className="col-md-6 col-lg-4">
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                No songs found in this genre.
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
