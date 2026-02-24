import React, { useState, useEffect } from 'react';

export default function EditSongModal({ show, song, onSave, onClose, saving = false }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lyrics: ''
    });

    useEffect(() => {
        if (song) {
            setFormData({
                title: song.title || '',
                description: song.description || '',
                lyrics: song.lyrics || ''
            });
        }
    }, [song, show]);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave?.(formData);
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Edit Song Details</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={saving} />
                    </div>
                    <form onSubmit={handleSave}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Lyrics</label>
                                <textarea
                                    className="form-control"
                                    name="lyrics"
                                    rows={8}
                                    value={formData.lyrics}
                                    onChange={handleChange}
                                    placeholder="Paste lyrics here..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                                {saving ? (
                                    <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
