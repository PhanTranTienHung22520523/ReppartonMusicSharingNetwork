import Navbar from "./Navbar";
import MusicPlayerBar from "./MusicPlayerBar";

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
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
      <MusicPlayerBar />
    </div>
  );
}