import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Dropdown } from "react-bootstrap";
import MainLayout from "../components/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import ReportDetailsModal from "../components/ReportDetailsModal";
import {
  FaFlag,
  FaFilter,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaMusic,
  FaUser,
  FaComment,
  FaEllipsisV,
  FaEye,
  FaTrash,
  FaBan
} from "react-icons/fa";
import { deleteSong } from "../api/songService";
import { deletePost } from "../api/postService";
import { deleteUserAccount } from "../api/userService";
import { deleteComment } from "../api/commentService";
import * as reportApi from "../api/reportService";

export default function Reports() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!user) return;
    try {
      console.debug('[Reports] user ->', user);
      console.debug('[Reports] isAdmin() ->', isAdmin());
    } catch (e) { }
    setErrorMsg(null);
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
      setErrorMsg(error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await reportApi.getReportStatistics();
      console.log("[Reports] Raw stats:", data);

      const stats = {
        totalPending: data.totalPending ?? data.pending ?? data.PENDING ?? 0,
        totalResolved: data.totalResolved ?? data.resolved ?? data.RESOLVED ?? 0,
        totalRejected: data.totalRejected ?? data.rejected ?? data.REJECTED ?? 0
      };

      setStatistics(stats);
    } catch (error) {
      console.error("Failed to load statistics:", error);
      if (error.message === 'Unauthorized') {
        setErrorMsg('Unauthorized. Please login with an admin account.');
      } else {
        setErrorMsg(error.message || 'Failed to load statistics');
      }
    }
  };

  const handleUpdateStatus = async (reportId, status, resolution) => {
    try {
      const report = reports.find(r => r.id === reportId);

      if (status === 'RESOLVED' && report) {
        try {
          const itemType = report.reportType?.toUpperCase();
          const itemId = report.itemId;

          switch (itemType) {
            case 'SONG': await deleteSong(itemId); break;
            case 'POST': await deletePost(itemId); break;
            case 'USER': await deleteUserAccount(itemId); break;
            case 'COMMENT': await deleteComment(itemId); break;
            default: console.warn(`Unknown item type for deletion: ${itemType}`);
          }
        } catch (deleteError) {
          console.error("Failed to delete reported item:", deleteError);
          alert(`Warning: Failed to delete the reported content. It might verify manually. Error: ${deleteError.message}`);
        }
      }

      await reportApi.updateReportStatus(reportId, status, resolution);
      await loadReports();
      if (isAdmin()) {
        await loadStatistics();
      }
      setViewingReport(null);
    } catch (error) {
      console.error("Failed to update report:", error);
      alert(error.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    setSelectedReport(reportId);
    setShowConfirmDelete(true);
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const confirmDelete = async () => {
    try {
      await reportApi.deleteReport(selectedReport);
      setShowConfirmDelete(false);
      setSelectedReport(null);
      setViewingReport(null);
      await loadReports();
      if (isAdmin()) await loadStatistics();
    } catch (error) {
      console.error('Failed to delete report:', error);
      setShowConfirmDelete(false);
      setSelectedReport(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { icon: FaClock, color: "warning", text: t('reports.pending') },
      RESOLVED: { icon: FaCheck, color: "success", text: t('reports.resolved') },
      REJECTED: { icon: FaTimes, color: "danger", text: t('reports.rejected') }
    };

    const badge = badges[status?.toUpperCase()] || badges.PENDING;
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

  if (authLoading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

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
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout>
        {errorMsg && (
          <div className="container py-2">
            <div className="alert alert-danger">{errorMsg}</div>
          </div>
        )}
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fw-bold">
              <FaFlag className="me-2" />
              {isAdmin() ? t('reports.management') : t('reports.myReports')}
            </h1>

            <div className="d-flex gap-2 align-items-center">
              <FaFilter className="text-muted" />
              <select
                className="form-select"
                style={{ width: 150 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('reports.allStatus')}</option>
                <option value="PENDING">{t('reports.pending')}</option>
                <option value="RESOLVED">{t('reports.resolved')}</option>
                <option value="REJECTED">{t('reports.rejected')}</option>
              </select>
            </div>
          </div>

          {/* Statistics (Admin only) */}
          {isAdmin() && statistics && (
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h3 className="text-warning mb-0">{statistics.totalPending || 0}</h3>
                    <small className="text-muted">{t('reports.pending')}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h3 className="text-success mb-0">{statistics.totalResolved || 0}</h3>
                    <small className="text-muted">{t('reports.resolved')}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h3 className="text-danger mb-0">{statistics.totalRejected || 0}</h3>
                    <small className="text-muted">{t('reports.rejected')}</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports List */}
          {reports.length === 0 ? (
            <div className="text-center py-5">
              <FaFlag size={64} className="text-muted mb-3" />
              <h3>{t('reports.noReports')}</h3>
              <p className="text-muted">
                {filterStatus === "all"
                  ? t('reports.empty')
                  : `${t('reports.noReportsFilter')}: ${filterStatus}`}
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>{t('reports.table.type')}</th>
                      <th>{t('reports.table.reason')}</th>
                      <th>{t('reports.table.description')}</th>
                      <th>{t('reports.table.reporter')}</th>
                      <th>{t('reports.table.date')}</th>
                      <th>{t('reports.table.status')}</th>
                      {isAdmin() && <th>{t('reports.table.actions')}</th>}
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
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm" className="no-caret">
                                  <FaEllipsisV />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" popperConfig={{ strategy: "fixed" }}>
                                  <Dropdown.Item onClick={() => setViewingReport(report)}>
                                    <FaEye className="me-2 text-primary" /> {t('reports.action.viewDetails')}
                                  </Dropdown.Item>
                                  {(report.status?.toUpperCase() === "PENDING" || report.status?.toUpperCase() === "REVIEWING") && (
                                    <>
                                      <Dropdown.Divider />
                                      <Dropdown.Item onClick={() => handleUpdateStatus(report.id, "RESOLVED", "Issue has been resolved")}>
                                        <FaCheck className="me-2 text-success" /> {t('reports.action.resolve')}
                                      </Dropdown.Item>
                                      <Dropdown.Item onClick={() => handleUpdateStatus(report.id, "REJECTED", "Report rejected")}>
                                        <FaBan className="me-2 text-danger" /> {t('reports.action.reject')}
                                      </Dropdown.Item>
                                    </>
                                  )}
                                  <Dropdown.Divider />
                                  <Dropdown.Item onClick={() => handleDeleteReport(report.id)} className="text-danger">
                                    <FaTrash className="me-2" /> {t('reports.action.delete')}
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
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
      <ConfirmModal
        show={showConfirmDelete}
        title={t('reports.deleteTitle')}
        message={t('reports.confirmDelete')}
        confirmText={t('common.delete')}
        confirmVariant="danger"
        loading={false}
        onConfirm={confirmDelete}
        onClose={() => { setShowConfirmDelete(false); setSelectedReport(null); }}
      />
      <ReportDetailsModal
        show={!!viewingReport}
        onClose={() => setViewingReport(null)}
        report={viewingReport}
        onResolve={(id) => handleUpdateStatus(id, "RESOLVED", "Issue has been resolved")}
        onReject={(id) => handleUpdateStatus(id, "REJECTED", "Report rejected")}
        onDelete={handleDeleteReport}
      />
    </>
  );
}
