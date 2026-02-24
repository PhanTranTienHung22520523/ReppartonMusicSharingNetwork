import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import StoriesRow from "../components/Stories";

export default function Stories() {
  const location = useLocation();
  const navigate = useNavigate();
  const openStoryId = location?.state?.openStoryId;

  return (
    <MainLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Stories</h2>
          <button className="btn btn-primary" onClick={() => navigate("/create-story")}>
            Create Story
          </button>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <StoriesRow initialStoryId={openStoryId} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
