import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { getAllSongs } from "../api/songService";

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  const getSongId = (song) => {
    if (!song || typeof song !== "object") return undefined;
    return song.id ?? song.songId ?? song._id;
  };

  const normalizeSong = (song) => {
    if (!song || typeof song !== "object") return song;

    const normalizedId = getSongId(song);

    const audioUrl =
      song.audioUrl ??
      song.fileUrl ??
      song.fileUrl1 ??
      song.songUrl ??
      song.url ??
      song.audio;

    const coverUrl =
      song.coverArtUrl ??
      song.coverImageUrl ??
      song.coverUrl ??
      song.coverImage ??
      song.imageUrl ??
      song.thumbnailUrl ??
      song.cover;

    const artistName =
      song.artistName ??
      song.artist ??
      song.artistUsername ??
      song.artist?.username ??
      song.artist?.name ??
      song.uploadedBy ??
      song.uploaderName;

    const genre =
      song.genre ??
      song.genreName ??
      (Array.isArray(song.genres) && song.genres.length > 0 ? song.genres[0] : undefined);

    return {
      ...song,
      id: normalizedId,
      // keep compatibility for callers that still use songId
      songId: song.songId ?? normalizedId,
      audioUrl,
      coverUrl,
      artistName,
      genre: song.genre ?? genre,
    };
  };

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

  const { user } = useAuth();
  const userId = user?.id || user?.userId || user?._id;
  const storageKey = userId ? `music_state_${userId}` : null;

  // Load initial state from localStorage
  const getInitialState = () => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            song: parsed.song ? normalizeSong(parsed.song) : null,
            time: parsed.time || 0
          };
        }
      } catch (err) {
        console.warn("Failed to load music state from localStorage", err);
      }
    }
    return { song: null, time: 0 };
  };

  const initialState = getInitialState();
  const [currentSong, setCurrentSongRaw] = useState(initialState.song || normalizeSong(mockSongs[0]));
  const [allSongs, setAllSongs] = useState(mockSongs.map(normalizeSong));
  const [librarySongs, setLibrarySongs] = useState(mockSongs.map(normalizeSong));
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialState.time);
  const lastSongId = useRef(currentSong?.id);
  const manualQueueRef = useRef(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (storageKey && currentSong) {
      try {
        const stateToSave = {
          song: currentSong,
          time: currentTime
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      } catch (err) {
        console.warn("Failed to save music state to localStorage", err);
      }
    }
  }, [currentSong, currentTime, storageKey]);

  // Load user-specific state when user changes
  useEffect(() => {
    if (userId) {
      const saved = getInitialState();
      if (saved.song) {
        setCurrentSongRaw(saved.song);
        setCurrentTime(saved.time);
      }
    }
  }, [userId]);

  const pickRandomSong = (songs, excludeId) => {
    if (!Array.isArray(songs) || songs.length === 0) return null;
    const filtered = excludeId == null
      ? songs
      : songs.filter((s) => String(getSongId(s)) !== String(excludeId));
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const setCurrentSong = (song) => {
    setCurrentSongRaw(normalizeSong(song));
    setPlaying(true);
    setCurrentTime(0);
  };

  const setPlaylist = (songs) => {
    manualQueueRef.current = true;
    const next = Array.isArray(songs) ? songs.map(normalizeSong) : [];
    setAllSongs(next);
  };

  useEffect(() => {
    getAllSongs()
      .then(data => {
        console.log("Loaded songs from API:", data);
        // Handle both array and paginated response formats
        const songs = Array.isArray(data) ? data : (data.content || []);
        if (songs && songs.length > 0) {
          const normalizedSongs = songs.map(normalizeSong);
          // Always keep the up-to-date library list from DB
          setLibrarySongs(normalizedSongs);
          // Don't overwrite a manually-set queue (e.g., playlist playback)
          if (!manualQueueRef.current) {
            setAllSongs(normalizedSongs);
            // If no song is loaded from storage, default to the first one from DB
            if (!initialState.song) {
              setCurrentSongRaw(normalizedSongs[0]);
            }
          }
        } else {
          console.log("No songs in database, using mock songs");
        }
      })
      .catch((error) => {
        // Keep mock songs if API fails
        console.error("Failed to load songs from API:", error);
        console.log("Using mock songs for testing");
      });
  }, []);

  // Record song play when switching to a new song
  useEffect(() => {
    if (currentSong && currentSong.id !== lastSongId.current) {
      lastSongId.current = currentSong.id;
      setCurrentTime(0); // reset position when changing song
      // TODO: Implement play count tracking later
      console.log("Now playing:", currentSong.title, "by", currentSong.artistName || currentSong.uploadedBy);
    }
  }, [currentSong]);

  const playNext = () => {
    if (!currentSong || !Array.isArray(allSongs) || allSongs.length === 0) return;

    const currentId = getSongId(currentSong);
    let idx = allSongs.findIndex((s) => String(getSongId(s)) === String(currentId));

    if (idx < 0) {
      const fallback =
        allSongs.find((s) => String(getSongId(s)) !== String(currentId)) ?? allSongs[0];
      setCurrentSong(fallback);
      setPlaying(true);
      return;
    }

    // If we're playing a manual queue (playlist) and reached the end,
    // continue by randomizing songs from the DB library.
    if (manualQueueRef.current && idx === allSongs.length - 1) {
      const currentId = getSongId(currentSong);
      const randomFromLibrary = pickRandomSong(librarySongs, currentId);
      if (randomFromLibrary) {
        manualQueueRef.current = false;
        setAllSongs(Array.isArray(librarySongs) && librarySongs.length > 0 ? librarySongs : allSongs);
        setCurrentSong(randomFromLibrary);
        setPlaying(true);
        return;
      }
    }

    const nextIdx = (idx + 1) % allSongs.length;
    setCurrentSong(allSongs[nextIdx]);
    setPlaying(true);
  };

  const playPrev = () => {
    if (!currentSong || !Array.isArray(allSongs) || allSongs.length === 0) return;

    const currentId = getSongId(currentSong);
    let idx = allSongs.findIndex((s) => String(getSongId(s)) === String(currentId));

    if (idx < 0) {
      const fallback =
        allSongs.find((s) => String(getSongId(s)) !== String(currentId)) ?? allSongs[0];
      setCurrentSong(fallback);
      setPlaying(true);
      return;
    }

    const prevIdx = (idx - 1 + allSongs.length) % allSongs.length;
    setCurrentSong(allSongs[prevIdx]);
    setPlaying(true);
  };

  const playRandom = () => {
    if (!currentSong || !Array.isArray(allSongs) || allSongs.length === 0) return;

    const currentId = getSongId(currentSong);
    let otherSongs = allSongs.filter(
      (s) => String(getSongId(s)) !== String(currentId)
    );
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
      setPlaylist,
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
