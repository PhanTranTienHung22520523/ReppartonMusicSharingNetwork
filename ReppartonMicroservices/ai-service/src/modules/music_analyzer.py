"""
Music Analyzer Module
Uses librosa and other audio analysis libraries to extract musical features
"""

import librosa
import numpy as np
import logging
from typing import Dict, Any, List
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class MusicAnalyzer:
    """
    Analyzes audio files to extract musical features:
    - Tempo (BPM)
    - Key & Scale
    - Energy Level
    - Danceability
    - Mood Classification
    - Acousticness
    - Instrumentalness
    - Spectral features
    """
    
    def __init__(self):
        """Initialize the music analyzer"""
        self.sr = 22050  # Default sampling rate
        logger.info("MusicAnalyzer initialized")
        
    def analyze(self, audio_path: str) -> Dict[str, Any]:
        """
        Perform complete audio analysis
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary containing all analysis results
        """
        try:
            logger.info(f"Loading audio file: {audio_path}")
            
            # Load audio file
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            # Extract all features
            analysis = {
                'tempo': self._analyze_tempo(y, sr),
                'key': self._analyze_key(y, sr),
                'energy': self._analyze_energy(y),
                'danceability': self._analyze_danceability(y, sr),
                'mood': self._analyze_mood(y, sr),
                'acousticness': self._analyze_acousticness(y, sr),
                'instrumentalness': self._analyze_instrumentalness(y, sr),
                'valence': self._analyze_valence(y, sr),
                'loudness': self._analyze_loudness(y),
                'spectral_centroid': float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))),
                'zero_crossing_rate': float(np.mean(librosa.feature.zero_crossing_rate(y))),
            }
            
            logger.info(f"Analysis complete: Tempo={analysis['tempo']}, Key={analysis['key']}, Mood={analysis['mood']}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing audio: {str(e)}")
            raise
    
    def _analyze_tempo(self, y: np.ndarray, sr: int) -> float:
        """
        Analyze tempo (BPM) using beat tracking
        """
        try:
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            return float(tempo)
        except Exception as e:
            logger.warning(f"Error analyzing tempo: {str(e)}")
            return 120.0  # Default fallback
    
    def _analyze_key(self, y: np.ndarray, sr: int) -> str:
        """
        Analyze musical key using chroma features
        """
        try:
            # Extract chroma features
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            
            # Average chroma across time
            chroma_mean = np.mean(chroma, axis=1)
            
            # Find dominant pitch class
            key_idx = np.argmax(chroma_mean)
            
            # Map to note names
            notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            
            # Determine major/minor (simplified heuristic)
            # Check if minor third is strong
            minor_third = chroma_mean[(key_idx + 3) % 12]
            major_third = chroma_mean[(key_idx + 4) % 12]
            
            scale = 'minor' if minor_third > major_third else 'major'
            
            return f"{notes[key_idx]} {scale}"
            
        except Exception as e:
            logger.warning(f"Error analyzing key: {str(e)}")
            return "C major"
    
    def _analyze_energy(self, y: np.ndarray) -> float:
        """
        Calculate energy level (RMS)
        Range: 0.0 to 1.0
        """
        try:
            rms = librosa.feature.rms(y=y)
            energy = float(np.mean(rms))
            # Normalize to 0-1 range
            return min(energy * 10, 1.0)
        except Exception as e:
            logger.warning(f"Error analyzing energy: {str(e)}")
            return 0.5
    
    def _analyze_danceability(self, y: np.ndarray, sr: int) -> float:
        """
        Calculate danceability score based on beat strength and regularity
        Range: 0.0 to 1.0
        """
        try:
            # Get tempo and beat frames
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            
            # Calculate beat strength
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            beat_strength = np.mean(onset_env[beat_frames]) if len(beat_frames) > 0 else 0
            
            # Calculate beat regularity (lower variance = more regular)
            if len(beat_frames) > 1:
                beat_intervals = np.diff(beat_frames)
                regularity = 1.0 / (1.0 + np.std(beat_intervals))
            else:
                regularity = 0.5
            
            # Combine factors
            danceability = (beat_strength * 0.6 + regularity * 0.4)
            
            # Normalize to 0-1
            return float(min(danceability, 1.0))
            
        except Exception as e:
            logger.warning(f"Error analyzing danceability: {str(e)}")
            return 0.5
    
    def _analyze_mood(self, y: np.ndarray, sr: int) -> str:
        """
        Classify mood based on tempo, energy, and valence
        
        Moods: happy, sad, energetic, calm, angry, peaceful
        """
        try:
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            energy = self._analyze_energy(y)
            valence = self._analyze_valence(y, sr)
            
            # Simple mood classification
            if valence > 0.6:
                if tempo > 120:
                    return "happy"
                else:
                    return "peaceful"
            elif valence < 0.4:
                if energy > 0.6:
                    return "angry"
                else:
                    return "sad"
            else:
                if energy > 0.6:
                    return "energetic"
                else:
                    return "calm"
                    
        except Exception as e:
            logger.warning(f"Error analyzing mood: {str(e)}")
            return "neutral"
    
    def _analyze_valence(self, y: np.ndarray, sr: int) -> float:
        """
        Estimate valence (musical positivity/happiness)
        Range: 0.0 to 1.0
        
        Based on major/minor key, brightness, and spectral features
        """
        try:
            # Spectral centroid (brightness)
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
            brightness = float(np.mean(spectral_centroid)) / 4000.0  # Normalize
            brightness = min(brightness, 1.0)
            
            # Chroma-based positivity
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            
            # Major chords tend to have stronger 1st, 5th, and major 3rd
            # Minor chords have stronger minor 3rd
            major_strength = (chroma_mean[0] + chroma_mean[4] + chroma_mean[7]) / 3
            minor_strength = (chroma_mean[0] + chroma_mean[3] + chroma_mean[7]) / 3
            
            key_positivity = major_strength / (major_strength + minor_strength + 0.001)
            
            # Combine factors
            valence = (brightness * 0.5 + key_positivity * 0.5)
            
            return float(min(valence, 1.0))
            
        except Exception as e:
            logger.warning(f"Error analyzing valence: {str(e)}")
            return 0.5
    
    def _analyze_acousticness(self, y: np.ndarray, sr: int) -> float:
        """
        Estimate acousticness (how acoustic vs electronic)
        Range: 0.0 to 1.0
        
        Based on spectral features and harmonicity
        """
        try:
            # Spectral rolloff (lower = more acoustic)
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
            rolloff_mean = float(np.mean(spectral_rolloff)) / sr * 2
            
            # Harmonic-percussive separation
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            harmonic_ratio = np.sum(np.abs(y_harmonic)) / (np.sum(np.abs(y)) + 0.001)
            
            # Spectral flatness (lower = more harmonic/acoustic)
            spectral_flatness = librosa.feature.spectral_flatness(y=y)
            flatness = float(np.mean(spectral_flatness))
            
            # Combine factors (more harmonic, less flat = more acoustic)
            acousticness = (harmonic_ratio * 0.5 + (1 - flatness) * 0.3 + (1 - rolloff_mean) * 0.2)
            
            return float(min(max(acousticness, 0.0), 1.0))
            
        except Exception as e:
            logger.warning(f"Error analyzing acousticness: {str(e)}")
            return 0.5
    
    def _analyze_instrumentalness(self, y: np.ndarray, sr: int) -> float:
        """
        Estimate instrumentalness (presence of vocals)
        Range: 0.0 to 1.0 (higher = more instrumental, less vocals)
        
        Based on spectral features in vocal frequency range
        """
        try:
            # Focus on vocal frequency range (80-3000 Hz)
            vocal_range_low = 80
            vocal_range_high = 3000
            
            # Get spectrogram
            D = np.abs(librosa.stft(y))
            freqs = librosa.fft_frequencies(sr=sr)
            
            # Find indices for vocal range
            vocal_idx = np.where((freqs >= vocal_range_low) & (freqs <= vocal_range_high))[0]
            
            # Calculate energy in vocal range vs total
            vocal_energy = np.sum(D[vocal_idx, :])
            total_energy = np.sum(D)
            
            vocal_ratio = vocal_energy / (total_energy + 0.001)
            
            # Higher vocal ratio = less instrumental
            instrumentalness = 1.0 - min(vocal_ratio * 2, 1.0)
            
            return float(instrumentalness)
            
        except Exception as e:
            logger.warning(f"Error analyzing instrumentalness: {str(e)}")
            return 0.5
    
    def _analyze_loudness(self, y: np.ndarray) -> float:
        """
        Calculate average loudness in dB
        """
        try:
            rms = librosa.feature.rms(y=y)
            loudness_db = librosa.amplitude_to_db(rms)
            return float(np.mean(loudness_db))
        except Exception as e:
            logger.warning(f"Error analyzing loudness: {str(e)}")
            return -20.0
    
    def extract_features(self, audio_path: str) -> Dict[str, Any]:
        """
        Extract detailed features for machine learning
        
        Returns:
            MFCC, Chroma, Spectral features, etc.
        """
        try:
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            # Extract various features
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
            tonnetz = librosa.feature.tonnetz(y=y, sr=sr)
            
            features = {
                'mfcc_mean': mfcc.mean(axis=1).tolist(),
                'mfcc_std': mfcc.std(axis=1).tolist(),
                'chroma_mean': chroma.mean(axis=1).tolist(),
                'chroma_std': chroma.std(axis=1).tolist(),
                'spectral_contrast_mean': spectral_contrast.mean(axis=1).tolist(),
                'spectral_contrast_std': spectral_contrast.std(axis=1).tolist(),
                'tonnetz_mean': tonnetz.mean(axis=1).tolist(),
                'tonnetz_std': tonnetz.std(axis=1).tolist(),
            }
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            raise
