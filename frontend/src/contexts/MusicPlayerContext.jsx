import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getAllSongs, playSong } from "../api/songService";

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  // Mock songs for testing
  const mockSongs = [
    {
      id: 1,
      title: "Blinding Lights",
      artistName: "The Weeknd",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 200,
      genre: "Pop"
    },
    {
      id: 2,
      title: "Shape of You",
      artistName: "Ed Sheeran",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: 233,
      genre: "Pop"
    },
    {
      id: 3,
      title: "Someone Like You",
      artistName: "Adele",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273f7db43292a6a99b21b51d5b4",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      duration: 285,
      genre: "Soul"
    },
    {
      id: 4,
      title: "Levitating",
      artistName: "Dua Lipa",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273be841ba4bc24340152e3a79a",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      duration: 203,
      genre: "Dance"
    },
    {
      id: 5,
      title: "As It Was",
      artistName: "Harry Styles",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      duration: 167,
      genre: "Pop"
    }
  ];

  const [currentSong, setCurrentSong] = useState(mockSongs[0]); // Set first song as default
  const [allSongs, setAllSongs] = useState(mockSongs);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Save playback position
  const lastSongId = useRef(null);

  useEffect(() => {
    getAllSongs()
      .then(data => {
        // Handle both array and paginated response formats
        const songs = Array.isArray(data) ? data : (data.content || []);
        if (songs && songs.length > 0) {
          setAllSongs(songs);
          if (!currentSong) {
            setCurrentSong(songs[0]);
          }
        }
      })
      .catch(() => {
        // Keep mock songs if API fails
        console.log("Using mock songs for testing");
      });
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
