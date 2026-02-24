/**
 * Extracts duration from an audio URL (e.g., Cloudinary) if the provided duration is missing.
 * @param {string} url - The audio file URL.
 * @returns {Promise<number|null>} - A promise that resolves with the duration in seconds or null.
 */
export const fetchDurationFromUrl = (url) => {
    if (!url) return Promise.resolve(null);

    return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = url;
        audio.preload = "metadata";

        const handleMetadata = () => {
            if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
                resolve(audio.duration);
            } else {
                resolve(null);
            }
            cleanup();
        };

        const handleError = () => {
            resolve(null);
            cleanup();
        };

        const cleanup = () => {
            audio.removeEventListener("loadedmetadata", handleMetadata);
            audio.removeEventListener("error", handleError);
            audio.src = ""; // Stop loading
        };

        audio.addEventListener("loadedmetadata", handleMetadata);
        audio.addEventListener("error", handleError);
    });
};

/**
 * Formats duration in seconds to m:ss format.
 * @param {number|string} seconds 
 * @returns {string}
 */
export const formatDuration = (seconds) => {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total <= 0) return "0:00";
    const mins = Math.floor(total / 60);
    const secs = Math.floor(total % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
};

/**
 * Normalizes song object to ensure essential fields are present.
 * @param {object} song 
 * @returns {object}
 */
export const normalizeSong = (song) => {
    if (!song) return null;
    return {
        ...song,
        id: song.id || song._id || song._idstr,
        playsCount: song.playsCount ?? song.views ?? song.plays ?? 0,
        artistName: song.artistName || (typeof song.artist === 'object' ? song.artist?.name : null) || song.artist
    };
};
