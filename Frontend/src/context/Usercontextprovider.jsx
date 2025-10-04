import React from "react";
import usercontext from "@/context/usercontext";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toast"

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Usercontextprovider = ({ children }) => {

  const backendUrl = 'http://localhost:5001'
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')

  const [userData, setUserData] = useState(false)

  const fetchUserData = async () => {
    if (!token) {
      setUserData(false)
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/users/getuser`, {
        headers: {
          Authorization: `Bearer ${token}`   // ✅ standard way
        }
      });

      if (data.success) {
        setUserData(data.userData)
      } else {
        setUserData(false)
      }
    } catch (error) {
      toast.error("Session Expired Please Login Again")
      setUserData(false)
      setToken('')
      localStorage.removeItem('token')
      console.log(error)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [token])

  const value = {
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
  }

  return <usercontext.Provider value={value}>{children}</usercontext.Provider>;
};

export default Usercontextprovider;
