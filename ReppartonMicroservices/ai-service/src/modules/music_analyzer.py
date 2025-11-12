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
                'chords': self._analyze_chords(y, sr),
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
    
    def _analyze_chords(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """
        Analyze chord progression throughout the song
        
        Returns:
            Dictionary containing chord analysis results
        """
        try:
            # Extract chroma features for chord detection
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr, bins_per_octave=36)
            
            # Get beat positions for chord segmentation
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            
            # Segment audio into beat-synchronized windows
            hop_length = 512
            beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop_length)
            
            # Chord templates for major and minor chords
            chord_templates = self._get_chord_templates()
            
            # Detect chords for each segment
            chord_progression = []
            chord_confidence = []
            
            for i in range(len(beat_frames) - 1):
                start_frame = beat_frames[i]
                end_frame = beat_frames[i + 1]
                
                # Extract chroma segment
                segment_chroma = chroma[:, start_frame:end_frame]
                if segment_chroma.shape[1] == 0:
                    continue
                    
                chroma_mean = np.mean(segment_chroma, axis=1)
                
                # Find best matching chord
                best_chord = None
                best_score = -1
                
                for chord_name, template in chord_templates.items():
                    # Cosine similarity
                    score = np.dot(chroma_mean, template) / (np.linalg.norm(chroma_mean) * np.linalg.norm(template))
                    if score > best_score:
                        best_score = score
                        best_chord = chord_name
                
                if best_chord:
                    chord_progression.append({
                        'chord': best_chord,
                        'start_time': float(beat_times[i]),
                        'confidence': float(best_score)
                    })
                    chord_confidence.append(float(best_score))
            
            # Analyze chord progression patterns
            progression_analysis = self._analyze_progression(chord_progression)
            
            return {
                'progression': chord_progression,
                'unique_chords': list(set([c['chord'] for c in chord_progression])),
                'chord_count': len(chord_progression),
                'average_confidence': float(np.mean(chord_confidence)) if chord_confidence else 0.0,
                'progression_analysis': progression_analysis,
                'key_compatibility': self._analyze_key_compatibility(chord_progression)
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing chords: {str(e)}")
            return {
                'progression': [],
                'unique_chords': [],
                'chord_count': 0,
                'average_confidence': 0.0,
                'progression_analysis': {},
                'key_compatibility': {}
            }
    
    def _analyze_chords_from_file(self, audio_path: str) -> Dict[str, Any]:
        """
        Analyze chords from audio file (wrapper for external calls)
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary containing chord analysis results
        """
        try:
            logger.info(f"Loading audio file for chord analysis: {audio_path}")
            
            # Load audio file
            y, sr = librosa.load(audio_path, sr=self.sr)
            
            # Analyze chords
            return self._analyze_chords(y, sr)
            
        except Exception as e:
            logger.error(f"Error analyzing chords from file: {str(e)}")
            return {
                'progression': [],
                'unique_chords': [],
                'chord_count': 0,
                'average_confidence': 0.0,
                'progression_analysis': {},
                'key_compatibility': {}
            }
    
    def _get_chord_templates(self) -> Dict[str, np.ndarray]:
        """
        Generate chord templates for major and minor chords
        
        Returns:
            Dictionary mapping chord names to chroma templates
        """
        # Basic chord templates (12 semitones)
        templates = {}
        
        # Root notes
        roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        for i, root in enumerate(roots):
            # Major chord: root, major third, perfect fifth
            major_template = np.zeros(12)
            major_template[i] = 1.0  # root
            major_template[(i + 4) % 12] = 0.8  # major third
            major_template[(i + 7) % 12] = 0.8  # perfect fifth
            templates[f'{root}'] = major_template
            
            # Minor chord: root, minor third, perfect fifth
            minor_template = np.zeros(12)
            minor_template[i] = 1.0  # root
            minor_template[(i + 3) % 12] = 0.8  # minor third
            minor_template[(i + 7) % 12] = 0.8  # perfect fifth
            templates[f'{root}m'] = minor_template
            
            # Diminished chord: root, minor third, diminished fifth
            dim_template = np.zeros(12)
            dim_template[i] = 1.0  # root
            dim_template[(i + 3) % 12] = 0.8  # minor third
            dim_template[(i + 6) % 12] = 0.8  # diminished fifth
            templates[f'{root}dim'] = dim_template
            
            # Augmented chord: root, major third, augmented fifth
            aug_template = np.zeros(12)
            aug_template[i] = 1.0  # root
            aug_template[(i + 4) % 12] = 0.8  # major third
            aug_template[(i + 8) % 12] = 0.8  # augmented fifth
            templates[f'{root}aug'] = aug_template
            
            # Seventh chords
            maj7_template = np.zeros(12)
            maj7_template[i] = 1.0  # root
            maj7_template[(i + 4) % 12] = 0.8  # major third
            maj7_template[(i + 7) % 12] = 0.8  # perfect fifth
            maj7_template[(i + 11) % 12] = 0.6  # major seventh
            templates[f'{root}maj7'] = maj7_template
            
            min7_template = np.zeros(12)
            min7_template[i] = 1.0  # root
            min7_template[(i + 3) % 12] = 0.8  # minor third
            min7_template[(i + 7) % 12] = 0.8  # perfect fifth
            min7_template[(i + 10) % 12] = 0.6  # minor seventh
            templates[f'{root}m7'] = min7_template
        
        return templates
    
    def _analyze_progression(self, chord_progression: List[Dict]) -> Dict[str, Any]:
        """
        Analyze chord progression patterns
        
        Args:
            chord_progression: List of chord dictionaries
            
        Returns:
            Dictionary with progression analysis
        """
        if not chord_progression:
            return {}
        
        chords = [c['chord'] for c in chord_progression]
        
        # Count chord frequencies
        chord_counts = {}
        for chord in chords:
            chord_counts[chord] = chord_counts.get(chord, 0) + 1
        
        # Find most common chord (usually tonic)
        tonic_chord = max(chord_counts.items(), key=lambda x: x[1])[0] if chord_counts else None
        
        # Analyze transitions
        transitions = {}
        for i in range(len(chords) - 1):
            transition = f"{chords[i]} -> {chords[i+1]}"
            transitions[transition] = transitions.get(transition, 0) + 1
        
        # Calculate progression complexity
        unique_chords = len(set(chords))
        total_chords = len(chords)
        complexity = unique_chords / max(total_chords, 1)
        
        return {
            'chord_frequencies': chord_counts,
            'tonic_chord': tonic_chord,
            'common_transitions': dict(sorted(transitions.items(), key=lambda x: x[1], reverse=True)[:5]),
            'complexity_score': float(complexity),
            'progression_length': total_chords
        }
    
    def _analyze_key_compatibility(self, chord_progression: List[Dict]) -> Dict[str, Any]:
        """
        Analyze how well chords fit with the detected key
        
        Args:
            chord_progression: List of chord dictionaries
            
        Returns:
            Dictionary with key compatibility analysis
        """
        if not chord_progression:
            return {}
        
        # This is a simplified analysis - in practice, you'd use music theory rules
        chords = [c['chord'] for c in chord_progression]
        
        # Define common key signatures and their diatonic chords
        key_signatures = {
            'C major': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
            'G major': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
            'D major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
            'A major': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
            'E major': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
            'F major': ['F', 'Gm', 'Am', 'A#', 'C', 'Dm', 'Edim'],
            'B major': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
        }
        
        # Calculate compatibility for each key
        compatibility_scores = {}
        for key, diatonic_chords in key_signatures.items():
            matching_chords = sum(1 for chord in chords if chord in diatonic_chords)
            compatibility_scores[key] = float(matching_chords / len(chords))
        
        # Find best matching key
        best_key = max(compatibility_scores.items(), key=lambda x: x[1])
        
        return {
            'best_matching_key': best_key[0],
            'compatibility_score': best_key[1],
            'all_compatibilities': compatibility_scores
        }

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
