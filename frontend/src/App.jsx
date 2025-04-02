import React from "react"
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage  from "./pages/auth/signup/SignUpPage.jsx"
import HomePage from './pages/home/HomePage.jsx'
import LoginPage from "./pages/auth/login/LoginPage"
import Sidebar from "./components/common/Sidebar.jsx"
import RightPanel from "./components/common/RightPanel.jsx"
import NotificationPage from "./pages/notification/NotificationPage.jsx"
import ProfilePage from "./pages/profile/ProfilePage.jsx"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import { baseurl } from "./constant/url.js"
import LoadingSpinner from "./components/common/LoadingSpinner.jsx"

function App() {
  const { data : authUser, isLoading} = useQuery({
    queryKey : ["authUser"],    //with this query key we can call this queryfn where ever want in the system
    queryFn : async () => {
      try {
        const res = await fetch(`${baseurl}/api/auth/me`,{
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        })
        const data = await res.json();
        if(data.error){
          return null
        }
        if(!res.ok){
          throw new Error(data.error || "Something went wrong")
        }
        return data;        
      } catch (error) {
       throw error 
      }
    },
    retry: false
  })

  if(isLoading){
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg"/>
      </div>
    )
  }

  return (
      <div className= 'flex max-w-6xl mx-auto'>
        { authUser && <Sidebar/> }
        <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
          <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login"/>} />
          <Route path="/profile/:userName" element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
        </Routes> 
        { authUser && <RightPanel/> }
        <Toaster/>       
      </div>
  )
}

export default App
