import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { PreferencesProvider } from "./context/PreferencesContext";

function App() {
  return (
    <ToastProvider>
      <PreferencesProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </PreferencesProvider>
    </ToastProvider>
  );
}

export default App;
