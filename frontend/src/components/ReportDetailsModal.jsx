import { createPortal } from "react-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { FaTimes, FaUser, FaClock, FaCheck, FaExclamationTriangle } from "react-icons/fa";

export default function ReportDetailsModal({
    show,
    onClose,
    report,
    onResolve,
    onReject,
    onDelete,
    onStartReview
}) {
    const { t } = useLanguage();

    if (!show || !report) return null;

    // Normalize status to handle case sensitivity issues
    const currentStatus = report.status ? report.status.toUpperCase() : "PENDING";

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { color: "warning", text: t('reports.pending') },
            REVIEWING: { color: "info", text: "Reviewing" },
            RESOLVED: { color: "success", text: t('reports.resolved') },
            REJECTED: { color: "danger", text: t('reports.rejected') }
        };

        const badge = badges[status] || badges.PENDING;

        return (
            <span className={`badge bg-${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    return createPortal(
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{t('reports.detailsTitle')}</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="row g-3">
                            {/* Header Info */}
                            <div className="col-12 d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <h6 className="text-muted mb-1">{t('reports.table.status')}</h6>
                                    {getStatusBadge(currentStatus)}
                                </div>
                                <div className="text-end">
                                    <h6 className="text-muted mb-1">{t('reports.table.date')}</h6>
                                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            <hr />

                            {/* Report Info */}
                            <div className="col-md-6">
                                <h6 className="fw-bold"><FaExclamationTriangle className="me-2 text-warning" />{t('reports.table.reason')}</h6>
                                <p className="border p-2 rounded bg-light">{report.reason}</p>
                            </div>

                            <div className="col-md-6">
                                <h6 className="fw-bold"><FaUser className="me-2 text-primary" />{t('reports.table.reporter')}</h6>
                                <p className="border p-2 rounded bg-light">
                                    {report.reporterName || "Anonymous"}
                                    {report.reporterId && <small className="text-muted ms-2">(ID: {report.reporterId})</small>}
                                </p>
                            </div>

                            <div className="col-12">
                                <h6 className="fw-bold">{t('reports.targetItem')}</h6>
                                <div className="border p-2 rounded bg-light d-flex gap-3 align-items-center">
                                    <span className="badge bg-secondary">{report.reportType}</span>
                                    <span>ID: {report.itemId || "N/A"}</span>
                                </div>
                            </div>

                            <div className="col-12">
                                <h6 className="fw-bold">{t('reports.table.description')}</h6>
                                <div className="border p-3 rounded" style={{ minHeight: '100px', backgroundColor: '#f8f9fa' }}>
                                    {report.description || <em className="text-muted">{t('reports.noDescription')}</em>}
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="modal-footer justify-content-between">
                        <div>
                            {/* Actions for PENDING and REVIEWING */}
                            {(currentStatus === "PENDING" || currentStatus === "REVIEWING") && (
                                <>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={() => onResolve(report.id)}
                                    >
                                        <FaCheck className="me-1" /> {t('reports.action.resolve')}
                                    </button>
                                    <button
                                        className="btn btn-danger me-2"
                                        onClick={() => onReject(report.id)}
                                    >
                                        <FaTimes className="me-1" /> {t('reports.action.reject')}
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-danger" onClick={() => onDelete(report.id)}>
                                {t('reports.action.delete')}
                            </button>
                            <button className="btn btn-secondary" onClick={onClose}>{t('common.close')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
