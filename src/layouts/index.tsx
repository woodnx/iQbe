import { Route, Routes, useLocation } from "react-router-dom"
import Home from "../pages/home"
import Login from "../pages/login"
import DefaultLayout from "./default"
import DraftLayout from "./draft"

export default function Root() {
  const location = useLocation()
  const requiredLogin = location.pathname !== '/login'

  const Layout = requiredLogin ? DefaultLayout : DraftLayout
  //const Layout = DefaultLayout

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
    </Layout>  
  )
}