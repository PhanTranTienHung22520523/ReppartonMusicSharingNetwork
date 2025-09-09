import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './utils/tokenHandler'; // Initialize global token expiration handler
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <MusicPlayerProvider>
        <App />
      </MusicPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);