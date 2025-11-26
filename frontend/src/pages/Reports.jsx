import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import MainLayout from "../components/MainLayout";
import { 
  FaFlag, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaExclamationTriangle,
  FaMusic,
  FaUser,
  FaComment
} from "react-icons/fa";
import * as reportApi from "../api/reportService";

export default function Reports() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadReports();
    if (isAdmin()) {
      loadStatistics();
    }
  }, [filterStatus, user, isAdmin]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const status = filterStatus === "all" ? null : filterStatus;
      
      if (isAdmin()) {
        const data = await reportApi.getAllReports(0, 50, status);
        setReports(data.content || []);
      } else {
        const data = await reportApi.getUserReports();
        setReports(data || []);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await reportApi.getReportStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const handleUpdateStatus = async (reportId, status, resolution) => {
    try {
      await reportApi.updateReportStatus(reportId, status, resolution);
      await loadReports();
      if (isAdmin()) {
        await loadStatistics();
      }
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to update report:", error);
      alert(error.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }
    
    try {
      await reportApi.deleteReport(reportId);
      await loadReports();
      if (isAdmin()) {
        await loadStatistics();
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
      alert(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { icon: FaClock, color: "warning", text: "Pending" },
      REVIEWING: { icon: FaClock, color: "info", text: "Reviewing" },
      RESOLVED: { icon: FaCheck, color: "success", text: "Resolved" },
      REJECTED: { icon: FaTimes, color: "danger", text: "Rejected" }
    };
    
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    
    return (
      <span className={`badge bg-${badge.color}`}>
        <Icon className="me-1" size={12} />
        {badge.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      SONG: FaMusic,
      USER: FaUser,
      COMMENT: FaComment,
      POST: FaComment
    };
    
    return icons[type] || FaFlag;
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <FaFlag size={64} className="text-muted mb-3" />
          <h3>Please login to view reports</h3>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">
            <FaFlag className="me-2" />
            {isAdmin() ? "Report Management" : "My Reports"}
          </h1>
          
          <div className="d-flex gap-2 align-items-center">
            <FaFilter className="text-muted" />
            <select 
              className="form-select"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Statistics (Admin only) */}
        {isAdmin() && statistics && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h3 className="text-warning mb-0">{statistics.totalPending || 0}</h3>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h3 className="text-info mb-0">{statistics.totalReviewing || 0}</h3>
                  <small className="text-muted">Reviewing</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h3 className="text-success mb-0">{statistics.totalResolved || 0}</h3>
                  <small className="text-muted">Resolved</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h3 className="text-danger mb-0">{statistics.totalRejected || 0}</h3>
                  <small className="text-muted">Rejected</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-5">
            <FaFlag size={64} className="text-muted mb-3" />
            <h3>No reports found</h3>
            <p className="text-muted">
              {filterStatus === "all" 
                ? "There are no reports yet" 
                : `No reports with status: ${filterStatus}`}
            </p>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Description</th>
                    <th>Reporter</th>
                    <th>Date</th>
                    <th>Status</th>
                    {isAdmin() && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => {
                    const TypeIcon = getTypeIcon(report.reportType);
                    return (
                      <tr key={report.id}>
                        <td>
                          <TypeIcon className="me-2" />
                          {report.reportType}
                        </td>
                        <td>
                          <strong>{report.reason}</strong>
                        </td>
                        <td>
                          <small className="text-muted">
                            {report.description?.substring(0, 50)}
                            {report.description?.length > 50 && "..."}
                          </small>
                        </td>
                        <td>
                          <small>{report.reporterName || "Anonymous"}</small>
                        </td>
                        <td>
                          <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td>
                          {getStatusBadge(report.status)}
                        </td>
                        {isAdmin() && (
                          <td>
                            <div className="d-flex gap-2">
                              {report.status === "PENDING" && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleUpdateStatus(report.id, "RESOLVED", "Issue has been resolved")}
                                    title="Resolve"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleUpdateStatus(report.id, "REJECTED", "Report rejected")}
                                    title="Reject"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteReport(report.id)}
                                title="Delete"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
