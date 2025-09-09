import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getAllSongs, playSong } from "../api/songService";

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Save playback position
  const lastSongId = useRef(null);

  useEffect(() => {
    getAllSongs()
      .then(data => {
        // Handle both array and paginated response formats
        const songs = Array.isArray(data) ? data : (data.content || []);
        setAllSongs(songs);
      })
      .catch(() => setAllSongs([]));
  }, []);

  // Record song play when switching to a new song
  useEffect(() => {
    if (currentSong && currentSong.id !== lastSongId.current) {
      lastSongId.current = currentSong.id;
      // Try to record play but don't fail if not authenticated
      playSong(currentSong.id).catch(error => {
        console.log("User not authenticated, skipping play recording:", error);
      });
      setCurrentTime(0); // reset position when changing song
    }
  }, [currentSong]);

  const playNext = () => {
    if (!currentSong || !Array.isArray(allSongs) || allSongs.length === 0) return;
    let idx = allSongs.findIndex(s => s.id === currentSong.id);
    let nextIdx = (idx + 1) % allSongs.length;
    setCurrentSong(allSongs[nextIdx]);
    setPlaying(true);
  };

  const playPrev = () => {
    if (!currentSong || !Array.isArray(allSongs) || allSongs.length === 0) return;
    let idx = allSongs.findIndex(s => s.id === currentSong.id);
    let prevIdx = (idx - 1 + allSongs.length) % allSongs.length;
    setCurrentSong(allSongs[prevIdx]);
    setPlaying(true);
  };

  const playRandom = () => {
    if (!currentSong || !Array.isArray(allSongs) || allSongs.length === 0) return;
    let otherSongs = allSongs.filter(s => s.id !== currentSong.id);
    if (otherSongs.length === 0) return;
    let randomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
    setCurrentSong(randomSong);
    setPlaying(true);
  };

  const playTrack = (song) => {
    setCurrentSong(song);
    setPlaying(true);
    setCurrentTime(0);
  };

  return (
    <MusicPlayerContext.Provider value={{
      currentSong, setCurrentSong,
      allSongs, setAllSongs,
      playing, setPlaying,
      playNext, playPrev, playRandom,
      currentTime, setCurrentTime,
      playTrack
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}
