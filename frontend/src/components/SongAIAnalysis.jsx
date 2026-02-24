import React from "react";
import { FaMusic, FaBolt, FaSyncAlt } from "react-icons/fa";

export default function SongAIAnalysis({ analysis, chordAnalysis, song, onReanalyze, loading }) {
  if (!analysis && !chordAnalysis) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <p className="text-muted mb-0">No AI analysis available</p>
        </div>
      </div>
    );
  }

  // Prefer unique_chords from the stored song analysis (GET /song), then fallbacks
  const extractUniqueFromAiRaw = (raw) => {
    if (!raw) return null;
    let obj = raw;
    try {
      if (typeof raw === 'string') obj = JSON.parse(raw);
    } catch (e) {
      // not JSON, ignore
    }

    const tryPaths = [
      (o) => o?.unique_chords,
      (o) => o?.uniqueChords,
      (o) => o?.chordAnalysis?.unique_chords,
      (o) => o?.analysis?.chords?.unique_chords,
      (o) => o?.chord_analysis?.unique_chords,
      (o) => o?.analysis?.unique_chords,
      (o) => o?.result?.unique_chords,
    ];

    for (const p of tryPaths) {
      const v = p(obj);
      if (Array.isArray(v) && v.length) return v;
    }

    // deeper search: find first array of strings under the object
    const seen = new Set();
    const stack = [obj];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== 'object') continue;
      for (const k of Object.keys(cur)) {
        const val = cur[k];
        if (Array.isArray(val) && val.length && val.every(x => typeof x === 'string')) return val;
        if (typeof val === 'object' && !seen.has(val)) {
          seen.add(val);
          stack.push(val);
        }
      }
    }
    return null;
  };

  const uniqueChords = (
    // primary source: analysis (from GET /song)
    (Array.isArray(analysis?.unique_chords) && analysis.unique_chords.length && analysis.unique_chords) ||
    // alternate shapes
    chordAnalysis?.uniqueChords || chordAnalysis?.unique_chords || analysis?.chordAnalysis?.unique_chords || analysis?.chordAnalysis?.uniqueChords ||
    analysis?.chord_analysis?.unique_chords ||
    // fallback: try parsing aiRaw (string or object) from analysis or song-level aiRaw
    extractUniqueFromAiRaw(analysis?.aiRaw) || extractUniqueFromAiRaw(song?.aiRaw) ||
    // fallback: extract names from chord lists if present
    (Array.isArray(chordAnalysis?.chords) ? Array.from(new Set(chordAnalysis.chords.map(c => (c?.name || c?.chord || c).toString()))) :
      (Array.isArray(analysis?.chordAnalysis?.chords) ? Array.from(new Set(analysis.chordAnalysis.chords.map(c => (c?.name || c?.chord || c).toString()))) : []))
  );

  const levelFromValue = (v) => {
    if (v == null) return { idx: 0, label: 'Unknown', color: '#9e9e9e' };
    let n = Number(v);
    if (n > 1) n = n / 100.0;
    if (isNaN(n)) return { idx: 0, label: 'Unknown', color: '#9e9e9e' };
    if (n < 0.25) return { idx: 1, label: 'Low', color: '#66bb6a' };
    if (n < 0.5) return { idx: 2, label: 'Medium', color: '#ffa726' };
    if (n < 0.75) return { idx: 3, label: 'High', color: '#fb8c00' };
    return { idx: 4, label: 'Very High', color: '#ef5350' };
  };

  const danceLevel = levelFromValue(analysis?.danceability);
  const energyLevel = levelFromValue(analysis?.energy);

  const getMoodColor = (mood) => {
    const colors = {
      happy: "#66bb6a",
      sad: "#42a5f5",
      energetic: "#ef5350",
      calm: "#9575cd",
      romantic: "#ec407a",
    };
    return colors[mood?.toLowerCase()] || "#757575";
  };

  return (
    <div className="card shadow-sm" style={{ maxWidth: 520 }}>
      <div className="card-header" style={{ background: 'linear-gradient(90deg,#4e54c8,#8f94fb)', color: 'white' }}>
        <h5 className="mb-0 d-flex align-items-center justify-content-between w-100" style={{ gap: 8 }}>
          <span className="d-flex align-items-center" style={{ gap: 8 }}>
            <FaMusic /> AI Music Analysis
          </span>
          {onReanalyze && (
            <button
              className="btn btn-sm btn-link text-white p-0 d-flex align-items-center"
              onClick={onReanalyze}
              disabled={loading}
              title="Re-analyze song"
              style={{ textDecoration: 'none', opacity: 0.8 }}
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} style={{ marginRight: 4 }} />
              <span style={{ fontSize: '0.8rem' }}>{loading ? "Analyzing..." : "Re-analyze"}</span>
            </button>
          )}
        </h5>
      </div>

      <div className="card-body" style={{ padding: '1.25rem' }}>
        <div className="d-flex mb-3">
          <div style={{ flex: 1 }}>
            <div className="small text-muted">Key</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{analysis?.key || analysis?.tonic || chordAnalysis?.key || 'N/A'}</div>
          </div>
          <div style={{ width: 120 }}>
            <div className="small text-muted">Tempo</div>
            <div style={{ fontWeight: 700 }}>{Math.round((analysis?.bpm || analysis?.tempo || chordAnalysis?.tempo || 0) || 0)} BPM</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="small text-muted">Mood</div>
          <div style={{ color: getMoodColor(analysis?.mood || chordAnalysis?.mood), fontWeight: 700 }}>{analysis?.mood || chordAnalysis?.mood || 'N/A'}</div>
        </div>

        <div className="mb-3">
          <div className="small text-muted mb-2">Unique Chords</div>
          {Array.isArray(uniqueChords) && uniqueChords.length > 0 ? (
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              {uniqueChords.map((uc, idx) => (
                <span key={idx} className="badge bg-light text-dark" style={{ padding: '6px 10px', borderRadius: 20, boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>{uc}</span>
              ))}
            </div>
          ) : (
            <div className="text-muted">No chord data</div>
          )}
        </div>

        {/* New Dominant Loop Section */}
        {(analysis?.chordAnalysis?.dominantLoop?.valid || chordAnalysis?.dominantLoop?.valid) && (
          <div className="mb-3 p-3" style={{ background: 'rgba(78, 84, 200, 0.05)', borderRadius: 12, border: '1px dashed rgba(78, 84, 200, 0.2)' }}>
            <div className="small text-muted d-flex align-items-center mb-2" style={{ gap: 6 }}>
              <FaSyncAlt className="text-primary" /> Dominant Loop
            </div>
            <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>
              {(analysis?.chordAnalysis?.dominantLoop?.sequence || chordAnalysis?.dominantLoop?.sequence || []).map((chord, idx) => (
                <React.Fragment key={idx}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4e54c8' }}>{chord}</div>
                  {idx < (analysis?.chordAnalysis?.dominantLoop?.sequence?.length || chordAnalysis?.dominantLoop?.sequence?.length || 0) - 1 && (
                    <div className="text-muted">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="small text-muted mt-1">
              Repeated {(analysis?.chordAnalysis?.dominantLoop?.occurrences || chordAnalysis?.dominantLoop?.occurrences || 0)} times
            </div>
          </div>
        )}

        <div className="d-flex gap-3">
          <div style={{ flex: 1 }}>
            <div className="small text-muted">Danceability</div>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <div style={{ flex: 1, height: 10, background: '#e9ecef', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((analysis?.danceability || 0) * 100)}%`, height: '100%', background: danceLevel.color }} />
              </div>
              <div className="small text-muted">{analysis?.danceability != null ? `${Math.round(analysis.danceability * 100)}%` : 'N/A'}</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="small text-muted">Energy</div>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <div style={{ flex: 1, height: 10, background: '#e9ecef', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((analysis?.energy || 0) * 100)}%`, height: '100%', background: energyLevel.color }} />
              </div>
              <div className="small text-muted">{analysis?.energy != null ? `${Math.round(analysis.energy * 100)}%` : 'N/A'}</div>
            </div>
          </div>
        </div>

        {analysis?.analyzedAt && (
          <div className="text-muted small mt-3">Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}
