import React from "react";
import AppRoutes from "./pages/AppRoutes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />
      <AppRoutes />
    </>
  );
}

export default App;
