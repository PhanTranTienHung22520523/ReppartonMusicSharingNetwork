import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import * as reportApi from "../api/reportService";

export default function ReportModal({ show, onClose, itemType = 'POST', itemId = null, onReported }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!show) return null;

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason'); return; }
    setSubmitting(true);
    try {
      const payload = {
        reporterId: user?.id || null,
        reporterName: user?.name || user?.username || 'Anonymous',
        itemId: itemId || null,
        itemType: itemType || 'POST',
        reason,
        description
      };
      await reportApi.createReport(payload);
      setError(null);
      onReported?.();
      onClose?.();
    } catch (e) {
      console.error('Failed to submit report', e);
      setError(e.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Report {itemType}</h5>
            <button className="btn-close" onClick={() => !submitting && onClose?.()} />
          </div>
          <div className="modal-body">
            {!user && (
              <div className="alert alert-warning">Please login to submit a report.</div>
            )}

            <div className="mb-3">
              <label className="form-label">Reason</label>
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Select reason</option>
                <option value="INAPPROPRIATE">Inappropriate content</option>
                <option value="SPAM">Spam / Scam</option>
                <option value="HARASSMENT">Harassment / Hate</option>
                <option value="COPYRIGHT">Copyright infringement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Details (optional)</label>
              <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={() => !submitting && onClose?.()} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !user}>
              {submitting ? (<><span className="spinner-border spinner-border-sm me-2" />Submitting</>) : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
