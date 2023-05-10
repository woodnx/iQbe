import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./routers/home"
import Login from "./routers/login"
import DefaultLayout from "./layouts/default"
import LoginLayout from "./layouts/login"

export default function Root() {
  const location = useLocation()
  const requiredLogin = location.pathname !== '/login'

  const Layout = requiredLogin ? DefaultLayout : LoginLayout

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
    </Layout>  
  )
}