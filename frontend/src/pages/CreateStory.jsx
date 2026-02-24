import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { createStory } from '../api/storyService';
import { FaImage, FaVideo, FaTimes, FaSpinner, FaPalette, FaFont, FaArrowLeft, FaAlignLeft } from 'react-icons/fa';

export default function CreateStory() {
  const [mediaType, setMediaType] = useState('image'); // 'image', 'video', 'text'
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#6366f1');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('24');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const backgroundColors = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4'
  ];

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setMediaFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTypeChange = (type) => {
    setMediaType(type);
    setMediaFile(null);
    setMediaPreview(null);
    setError(null);
    if (type === 'text') {
      setCaption('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mediaType === 'text' && !caption.trim()) {
      setError('Please enter some text for your story');
      return;
    }
    if ((mediaType === 'image' || mediaType === 'video') && !mediaFile) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);

      // storyService.createStory expects a plain object and will build FormData internally.
      // (Passing FormData here would result in missing fields being sent.)
      if (mediaType === 'text') {
        await createStory({
          type: 'text',
          content: caption,
          isPrivate: false,
          // UI-only fields (backend may ignore)
          backgroundColor,
          textColor,
          fontSize,
        });
      } else if (mediaType === 'image') {
        await createStory({
          type: 'image',
          content: caption,
          image: mediaFile,
          isPrivate: false,
        });
      } else {
        await createStory({
          type: 'video',
          content: caption,
          video: mediaFile,
          isPrivate: false,
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-link text-decoration-none"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="me-2" />
                Back
              </button>
              <h2 className="mb-0 ms-3">Create Story</h2>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <FaTimes className="me-2" />
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title mb-3">Story Type</h5>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${mediaType === 'image' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTypeChange('image')}
                  >
                    <FaImage className="me-2" />
                    Image
                  </button>
                  <button
                    type="button"
                    className={`btn ${mediaType === 'video' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTypeChange('video')}
                  >
                    <FaVideo className="me-2" />
                    Video
                  </button>
                  <button
                    type="button"
                    className={`btn ${mediaType === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTypeChange('text')}
                  >
                    <FaAlignLeft className="me-2" />
                    Text
                  </button>
                </div>
              </div>
            </div>

            {/* Content Creation */}
            <form onSubmit={handleSubmit}>
              <div className="card mb-3">
                <div className="card-body">
                  {mediaType === 'text' ? (
                    // Text Story Editor
                    <div>
                      <div 
                        className="story-preview mb-3 rounded d-flex align-items-center justify-content-center p-4"
                        style={{
                          backgroundColor: backgroundColor,
                          color: textColor,
                          minHeight: '400px',
                          fontSize: `${fontSize}px`,
                          fontWeight: '600',
                          textAlign: 'center',
                          wordBreak: 'break-word'
                        }}
                      >
                        {caption || 'Type your text here...'}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          <FaFont className="me-2" />
                          Your Text
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="What's on your mind?"
                          maxLength="200"
                        />
                        <small className="text-muted">{caption.length}/200</small>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          <FaPalette className="me-2" />
                          Background Color
                        </label>
                        <div className="d-flex gap-2 flex-wrap">
                          {backgroundColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`btn p-0 border ${backgroundColor === color ? 'border-dark border-3' : ''}`}
                              style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: color,
                                borderRadius: '8px'
                              }}
                              onClick={() => setBackgroundColor(color)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          <FaPalette className="me-2" />
                          Text Color
                        </label>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className={`btn p-0 border ${textColor === '#ffffff' ? 'border-dark border-3' : ''}`}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: '#ffffff',
                              borderRadius: '8px'
                            }}
                            onClick={() => setTextColor('#ffffff')}
                          />
                          <button
                            type="button"
                            className={`btn p-0 border ${textColor === '#000000' ? 'border-dark border-3' : ''}`}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: '#000000',
                              borderRadius: '8px'
                            }}
                            onClick={() => setTextColor('#000000')}
                          />
                          <button
                            type="button"
                            className={`btn p-0 border ${textColor === '#fbbf24' ? 'border-dark border-3' : ''}`}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: '#fbbf24',
                              borderRadius: '8px'
                            }}
                            onClick={() => setTextColor('#fbbf24')}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Font Size</label>
                        <input
                          type="range"
                          className="form-range"
                          min="16"
                          max="48"
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                        />
                        <small className="text-muted">{fontSize}px</small>
                      </div>
                    </div>
                  ) : (
                    // Image/Video Story
                    <div>
                      {mediaPreview ? (
                        <div className="position-relative mb-3">
                          {mediaType === 'image' ? (
                            <img
                              src={mediaPreview}
                              alt="Preview"
                              className="img-fluid rounded"
                              style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <video
                              src={mediaPreview}
                              controls
                              className="img-fluid rounded"
                              style={{ maxHeight: '400px', width: '100%' }}
                            />
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                            onClick={() => {
                              setMediaFile(null);
                              setMediaPreview(null);
                            }}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="border border-dashed rounded p-5 text-center mb-3"
                          style={{ cursor: 'pointer' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {mediaType === 'image' ? (
                            <FaImage size={48} className="text-muted mb-3" />
                          ) : (
                            <FaVideo size={48} className="text-muted mb-3" />
                          )}
                          <p className="mb-0">Click to select {mediaType}</p>
                          <small className="text-muted">Max size: 50MB</small>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                        onChange={handleMediaSelect}
                        className="d-none"
                      />

                      <div className="mb-3">
                        <label className="form-label">Caption (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Add a caption..."
                          maxLength="200"
                        />
                        <small className="text-muted">{caption.length}/200</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner-border spinner-border-sm me-2" />
                      Creating Story...
                    </>
                  ) : (
                    'Share Story'
                  )}
                </button>
              </div>
            </form>

            {/* Info */}
            <div className="alert alert-info mt-3">
              <small>
                <strong>Note:</strong> Stories will disappear after 24 hours and can be viewed by your friends.
              </small>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
