import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import SearchResults from "../components/SearchResults";
import { globalSearch, searchSongs, searchUsers, searchPlaylists, getSearchSuggestions } from "../api/searchService";
import { FaSearch, FaFilter, FaHistory, FaTimes, FaMusic, FaUser, FaUsers, FaList } from "react-icons/fa";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const searchInputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const query = searchParams.get("q");
    const tab = searchParams.get("tab") || "all";
    if (query) {
      setSearchQuery(query);
      setActiveTab(tab);
      performSearch(query, tab);
    }
  }, [searchParams]);

  // Save recent searches
  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const performSearch = async (query, tab = activeTab) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      console.log("Searching for:", query, "in tab:", tab);
      let results;
      
      switch (tab) {
        case "songs":
          results = await searchSongs(query.trim());
          console.log("Songs search raw results:", results);
          results = { songs: results.content || results, users: [], playlists: [] };
          break;
        case "users":
          results = await searchUsers(query.trim());
          console.log("Users search raw results:", results);
          results = { songs: [], users: results.content || results, playlists: [] };
          break;
        case "playlists":
          results = await searchPlaylists(query.trim());
          console.log("Playlists search raw results:", results);
          results = { songs: [], users: [], playlists: results.content || results };
          break;
        default:
          results = await globalSearch(query.trim());
          console.log("Global search raw results:", results);
      }
      
      console.log("Final processed results:", results);
      setSearchResults(results);
      saveRecentSearch(query.trim());
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ 
        q: searchQuery.trim(),
        ...(activeTab !== "all" && { tab: activeTab })
      });
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    const value = e.target.value;
    setShowSuggestions(value.length > 0);
    
    // Get search suggestions for non-empty queries
    if (value.trim().length > 2) {
      getSuggestions(value.trim());
    } else {
      setSearchSuggestions([]);
    }
  };

  const getSuggestions = async (query) => {
    try {
      const suggestions = await getSearchSuggestions(query);
      setSearchSuggestions(suggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      setSearchSuggestions([]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (searchQuery.trim()) {
      setSearchParams({ 
        q: searchQuery.trim(),
        ...(tab !== "all" && { tab })
      });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setSearchParams({ 
      q: suggestion.title,
      ...(activeTab !== "all" && { tab: activeTab })
    });
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    setSearchParams({ 
      q: query,
      ...(activeTab !== "all" && { tab: activeTab })
    });
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setShowSuggestions(searchQuery.length > 0 || recentSearches.length > 0);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Search Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="mb-3">
                  <FaSearch className="me-2" />
                  Discover Music & Artists
                </h2>
                
                {/* Search Form */}
                <form onSubmit={handleSearch} className="position-relative">
                  <div className="input-group mb-3">
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Search for songs, artists, albums, or people..."
                      value={searchQuery}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      autoFocus
                    />
                    <button 
                      className="btn btn-primary px-4" 
                      type="submit"
                      disabled={!searchQuery.trim()}
                    >
                      <FaSearch />
                    </button>
                  </div>

                  {/* Search Suggestions & Recent Searches */}
                  {showSuggestions && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 p-3" style={{zIndex: 1000}}>
                      {/* Search Suggestions */}
                      {searchSuggestions.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted fw-bold mb-2 d-block">
                            <FaSearch className="me-1" />
                            Suggestions
                          </small>
                          <div className="list-group list-group-flush">
                            {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                              <button
                                key={`${suggestion.type}-${suggestion.id}-${index}`}
                                type="button"
                                className="list-group-item list-group-item-action border-0 py-2 px-0 d-flex align-items-center"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion.type === 'song' && <FaMusic className="me-2 text-primary" />}
                                {suggestion.type === 'user' && <FaUser className="me-2 text-success" />}
                                {suggestion.type === 'playlist' && <FaList className="me-2 text-info" />}
                                <div className="flex-grow-1 text-start">
                                  <div className="fw-medium">{suggestion.title}</div>
                                  <small className="text-muted">{suggestion.subtitle}</small>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <small className="text-muted fw-bold">
                              <FaHistory className="me-1" />
                              Recent Searches
                            </small>
                            <button 
                              type="button"
                              className="btn btn-sm btn-link text-muted p-0"
                              onClick={clearRecentSearches}
                            >
                              Clear
                            </button>
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {recentSearches.slice(0, 5).map((search, index) => (
                              <button
                                key={index}
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleRecentSearchClick(search)}
                              >
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form>

                {/* Search Tabs */}
                <div className="d-flex align-items-center justify-content-between">
                  <ul className="nav nav-pills">
                    {[
                      { id: "all", label: "All", icon: FaSearch },
                      { id: "songs", label: "Songs", icon: FaMusic },
                      { id: "users", label: "Artists", icon: FaUser },
                      { id: "playlists", label: "Playlists", icon: FaList }
                    ].map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <li className="nav-item" key={tab.id}>
                          <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                          >
                            <IconComponent className="me-1" />
                            {tab.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Sort Options */}
                  {searchResults && (
                    <div className="d-flex align-items-center">
                      <FaFilter className="me-2 text-muted" />
                      <select 
                        className="form-select form-select-sm" 
                        style={{width: 'auto'}}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="relevance">Most Relevant</option>
                        <option value="newest">Newest</option>
                        <option value="popular">Most Popular</option>
                        <option value="alphabetical">A-Z</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchParams.get("q") ? (
          <div>
            {error && (
              <div className="alert alert-danger" role="alert">
                <FaSearch className="me-2" />
                Search error: {error}
              </div>
            )}
            <SearchResults 
              results={searchResults} 
              loading={loading} 
              query={searchParams.get("q")} 
              activeTab={activeTab}
              sortBy={sortBy}
            />
          </div>
        ) : (
          <div className="text-center py-5">
            <FaSearch size={64} className="text-primary mb-4 opacity-75" />
            <h4 className="mb-3">Discover Amazing Music</h4>
            <p className="text-muted mb-4">
              Search for your favorite songs, discover new artists, and explore curated playlists.
            </p>
            
            {/* Popular Categories */}
            <div className="row justify-content-center">
              <div className="col-md-8">
                <h6 className="mb-3">Popular Categories</h6>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {["Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical"].map((genre) => (
                    <button
                      key={genre}
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setSearchQuery(genre);
                        setSearchParams({ q: genre });
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
