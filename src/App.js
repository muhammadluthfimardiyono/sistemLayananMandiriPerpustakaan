import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SignUpSuccess from "./pages/SignUpSuccess";
import Home from "./pages/Home";
import KonfirmasiPeminjaman from "./pages/konfirmasiPeminjaman";
import ScanPagePeminjaman from "./pages/ScanPagePeminjaman";
import ScanPagePengembalian from "./pages/ScanPagePengembalian";
import KonfirmasiPengembalian from "./pages/konfirmasiPengembalian";
import PengembalianID from "./pages/PengembalianID";
import BuktiPeminjaman from "./pages/BuktiPeminjaman";
import PembayaranDenda from "./pages/PembayaranDenda";

function ProtectedRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    if (localStorage.getItem("userData")) {
      setCurrentUser("signedIn"); // Menandakan pengguna telah masuk (signed in)
    } else {
      setCurrentUser(null); // Menandakan pengguna belum masuk (not signed in)
    }
  }, []);

  if (currentUser === undefined) {
    return null; // Tampilkan null selama status pengguna belum ditentukan
  }

  if (!currentUser) {
    return <Navigate to="/" />; // Alihkan pengguna ke halaman login jika belum masuk
  }

  return children; // Tampilkan komponen anak jika pengguna sudah masuk
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan-pinjam"
        element={
          <ProtectedRoute>
            <ScanPagePeminjaman />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan-kembali"
        element={
          <ProtectedRoute>
            <ScanPagePengembalian />
          </ProtectedRoute>
        }
      />
      <Route
        path="/konfirmasi-peminjaman"
        element={
          <ProtectedRoute>
            <KonfirmasiPeminjaman />
          </ProtectedRoute>
        }
      />
      <Route
        path="/konfirmasi-pengembalian"
        element={
          <ProtectedRoute>
            <KonfirmasiPengembalian />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pengembalian-id"
        element={
          <ProtectedRoute>
            <PengembalianID />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bukti-peminjaman"
        element={
          <ProtectedRoute>
            <BuktiPeminjaman />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembayaran-denda"
        element={
          <ProtectedRoute>
            <PembayaranDenda />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppRouter;
