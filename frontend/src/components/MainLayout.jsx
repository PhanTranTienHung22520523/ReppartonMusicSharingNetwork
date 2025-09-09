import Sidebar from "./Sidebar";
import Header from "./Header";
import MusicPlayerBar from "./MusicPlayerBar";

export default function MainLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Header />
        <main
          style={{
            marginLeft: 260,
            marginTop: 72,
            minHeight: "calc(100vh - 72px - 80px)",
            background: "var(--background-color)",
            padding: "24px",
            paddingBottom: "104px", // Add extra padding for music player (80px + 24px)
          }}
        >
          <div className="container-fluid">
            {children}
          </div>
        </main>
        <MusicPlayerBar />
      </div>
    </div>
  );
}