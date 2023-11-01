import React from "react";
import { Route, Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, ...props }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Route {...props} />;
};

export default ProtectedRoute;
