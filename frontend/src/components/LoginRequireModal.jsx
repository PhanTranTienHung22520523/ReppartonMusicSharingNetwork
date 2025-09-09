import { useNavigate } from "react-router-dom";

export default function LoginRequireModal({ show, onClose }) {
  const navigate = useNavigate();
  if (!show) return null;
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center">
            <h5>Bạn cần đăng nhập để sử dụng chức năng này!</h5>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/login")}>Đăng nhập</button>
            <button className="btn btn-link mt-3" onClick={onClose}>Để sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}