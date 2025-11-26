import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import MainLayout from "../components/MainLayout";
import SearchResults from "../components/SearchResults";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  getRecentSongs,
  getNewestSongs,
  getMostViewedSongs,
} from "../api/discoverService";

import SongCard from "../components/SongCard";

export default function Discover() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [recent, setRecent] = useState([]);
  const [newest, setNewest] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  const uniqueRecent = recent.filter(
    (song, idx, arr) => arr.findIndex(s => s.id === song.id) === idx
  );

  useEffect(() => {
    setLoading(true);
    const promises = [
      getNewestSongs().then(data => setNewest(data)).catch(() => setNewest([])),
      getMostViewedSongs().then(data => setMostViewed(data)).catch(() => setMostViewed([])),
    ];
    if (user) {
    promises.push(getRecentSongs(user.id, 5).then(response => {
      setRecent(response.success ? response.data : []);
    }).catch(() => setRecent([])));
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [user]);

  // If there's a search query, show search results
  if (searchQuery) {
    return (
      <MainLayout>
        <SearchResults />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h3 className="fw-bold mb-4">{t("discover.title")}</h3>
      {loading ? (
        <div>{t("common.loading")}</div>
      ) : (
        <>
          {user && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mt-4 mb-3">🎵 {t("discover.recent")}</h5>
                {uniqueRecent.length > 0 && (
                  <Link to="/recent-songs" className="btn btn-outline-primary btn-sm">
                    {t("discover.viewAll")} →
                  </Link>
                )}
              </div>
              <div className="row g-4 mb-4">
                {uniqueRecent.length === 0 && <div className="text-muted ms-3">{t("discover.recent")} - {t("common.loading")}</div>}
                {uniqueRecent.slice(0, 5).map(song => (
                  <div className="col-md-4" key={song.id}>
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            </>
          )}

          <h5 className="fw-bold mt-4 mb-3">{t("discover.newest")}</h5>
          <div className="row g-4 mb-4">
            {newest.length === 0 && <div className="text-muted ms-3">{t("common.loading")}</div>}
            {newest.map(song => (
              <div className="col-md-4" key={song.id}>
                <SongCard song={song} />
              </div>
            ))}
          </div>

          <h5 className="fw-bold mt-4 mb-3">{t("discover.mostViewed")}</h5>
          <div className="row g-4 mb-4">
            {mostViewed.length === 0 && <div className="text-muted ms-3">{t("common.loading")}</div>}
            {mostViewed.map(song => (
              <div className="col-md-4" key={song.id}>
                <SongCard song={song} />
              </div>
            ))}
          </div>
        </>
      )}
    </MainLayout>
  );
}