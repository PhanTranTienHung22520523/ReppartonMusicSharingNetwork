import React, { useState, useEffect } from 'react';

export default function EditModal({ show, title = 'Edit Post', initialContent = '', onSave, onClose, saving = false }) {
  const [value, setValue] = useState(initialContent || '');

  useEffect(() => {
    setValue(initialContent || '');
  }, [initialContent, show]);

  if (!show) return null;

  const handleSave = () => {
    onSave?.(value);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <textarea
              className="form-control"
              rows={6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Save</>
              ) : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
