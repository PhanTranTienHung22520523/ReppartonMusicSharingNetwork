import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import OnboardingModal from "./OnboardingModal";

export default function MainLayout({ children }) {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated but not yet onboarded
  const showOnboarding = isAuthenticated() && user && user.isOnboarded === false;

  return (
    <div className="main-layout">
      {showOnboarding && <OnboardingModal />}
      <Navbar />
      <main
        style={{
          marginTop: 60,
          minHeight: "calc(100vh - 60px - 80px)",
          background: "var(--background-color)",
          padding: "24px",
          paddingBottom: "104px", // Add extra padding for music player (80px + 24px)
        }}
      >
        <div className="container-fluid" style={{ maxWidth: 1400, margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}