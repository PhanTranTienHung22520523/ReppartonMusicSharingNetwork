import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { getUserDevices, removeDevice, trustDevice, recordCurrentDevice, getDeviceFingerprint, getDeviceType, getBrowserName, getOSName } from '../api/deviceService';
import { FaDesktop, FaMobileAlt, FaTabletAlt, FaCheck, FaTimes, FaMapMarkerAlt, FaClock, FaShieldAlt } from 'react-icons/fa';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadDevices();
    // Get current device fingerprint
    setCurrentDeviceId(getDeviceFingerprint());
  }, [navigate]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      let data = await getUserDevices();
      if (Array.isArray(data) && data.length === 0) {
        try {
          await recordCurrentDevice({
            deviceId: getDeviceFingerprint(),
            deviceName: `${getBrowserName()} on ${getOSName()}`,
            userAgent: navigator?.userAgent,
            deviceType: getDeviceType(),
          });
          data = await getUserDevices();
        } catch {
          // best-effort; still show empty state if recording fails
        }
      }
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (!confirm('Are you sure you want to remove this device? You will be logged out on that device.')) {
      return;
    }

    try {
      await removeDevice(deviceId);
      // If removing current device, logout
      if (deviceId === currentDeviceId) {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        loadDevices();
      }
    } catch (err) {
      alert('Failed to remove device: ' + err.message);
    }
  };

  const handleTrustDevice = async (deviceId) => {
    try {
      await trustDevice(deviceId);
      loadDevices();
    } catch (err) {
      alert('Failed to trust device: ' + err.message);
    }
  };

  const getDeviceIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'mobile':
        return <FaMobileAlt className="text-primary" size={24} />;
      case 'tablet':
        return <FaTabletAlt className="text-primary" size={24} />;
      default:
        return <FaDesktop className="text-primary" size={24} />;
    }
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="mb-2">
              <FaShieldAlt className="me-2" />
              Device Management
            </h2>
            <p className="text-muted">
              Manage devices where you're logged in. You can remove devices or mark them as trusted.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <FaTimes className="me-2" />
            {error}
          </div>
        )}

        {devices.length === 0 ? (
          <div className="alert alert-info">
            <p className="mb-0">No devices found. This might be your first login!</p>
          </div>
        ) : (
          <div className="row g-3">
            {devices.map((device) => {
              const isCurrentDevice = device.id === currentDeviceId || device.deviceId === currentDeviceId;
              
              return (
                <div key={device.id} className="col-md-6 col-lg-4">
                  <div className={`card h-100 ${isCurrentDevice ? 'border-primary border-2' : ''}`}>
                    <div className="card-body">
                      {isCurrentDevice && (
                        <div className="badge bg-primary mb-2">Current Device</div>
                      )}
                      
                      <div className="d-flex align-items-start mb-3">
                        <div className="me-3">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">
                            {device.deviceName || getBrowserName() + ' on ' + getOSName()}
                          </h5>
                          <small className="text-muted">{device.deviceType || getDeviceType()}</small>
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted d-flex align-items-center mb-1">
                          <FaClock className="me-2" />
                          Last active: {formatLastActive(device.lastActiveAt)}
                        </small>
                        {device.location && (
                          <small className="text-muted d-flex align-items-center mb-1">
                            <FaMapMarkerAlt className="me-2" />
                            {device.location}
                          </small>
                        )}
                        {device.ipAddress && (
                          <small className="text-muted d-block">
                            IP: {device.ipAddress}
                          </small>
                        )}
                      </div>

                      {device.isTrusted && (
                        <div className="badge bg-success mb-2">
                          <FaCheck className="me-1" />
                          Trusted Device
                        </div>
                      )}

                      <div className="mt-3 d-flex gap-2">
                        {!device.isTrusted && !isCurrentDevice && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleTrustDevice(device.id)}
                          >
                            <FaCheck className="me-1" />
                            Trust
                          </button>
                        )}
                        {!isCurrentDevice && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveDevice(device.id)}
                          >
                            <FaTimes className="me-1" />
                            Remove
                          </button>
                        )}
                        {isCurrentDevice && (
                          <button className="btn btn-sm btn-secondary" disabled>
                            Current Device
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="card-footer text-muted small">
                      <div className="d-flex justify-content-between">
                        <span>Added: {new Date(device.createdAt).toLocaleDateString()}</span>
                        {device.userAgent && (
                          <span title={device.userAgent}>
                            {device.userAgent.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title">Security Tips</h5>
              <ul className="mb-0">
                <li>Remove devices you don't recognize immediately</li>
                <li>Trust only your personal devices</li>
                <li>Check this page regularly for suspicious activity</li>
                <li>If you see an unknown device, change your password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
