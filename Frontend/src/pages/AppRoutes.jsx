import React, { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import Landing from "./Landing";
import Signup from "./Signup";
import Login from "./Login";
import MyProfilePage from "./Myprofile";
import usercontext from "../context/usercontext";
import AboutUs from "./Aboutus";
import ChatBot from "./Chatbot";
import Dashboard from "./Dashboard";
import Localdashboard from "./Localdashboard";
import Salesdashboard from "./Salesdashboard";
import ChatPage from "./ChatPage";
import Saleschatpage from "./SalesChatpage";
import Analytics from "./Analytics";

const AppRoutes = () => {
  const { token,userData } = useContext(usercontext) || {}; 
  // if you’re not using context, just replace with: const token = localStorage.getItem("token");

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Landing />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Route */}
          <Route
            path="/profile"
            element={
              token ? <MyProfilePage /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/chatbot"
            element={
              token ? <ChatBot /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/analytics"
            element={
              token ? <Analytics /> : <Navigate to="/login" replace />
            }
          />

          <Route path="/chatpage"
           element={
           token ? (userData?.role == 'dealer' ?<ChatPage/> : <Saleschatpage/>) : <Navigate to="/login" replace />
          }
            />

          

          <Route
            path="/dashboard"
            element={
              token ? (userData?.role == 'dealer' ?<Localdashboard user={userData} /> : <Salesdashboard/>) : <Navigate to="/login" replace />
            }
          />



          <Route
            path="/about"
            element={
              <AboutUs/>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
};

export default AppRoutes;

