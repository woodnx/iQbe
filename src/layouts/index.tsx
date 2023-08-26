import { Route, Routes, useLocation } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/login";
import Search from "../pages/search";
import Practice from "../pages/practice";
import Favorite from "../pages/favorite";
import DefaultLayout from "./default";
import DraftLayout from "./draft";
import History from "../pages/history";
import Mylist from "../pages/mylists";

export default function Root() {
  const location = useLocation();
  const requiredLogin = location.pathname !== '/login';

  const Layout = requiredLogin ? DefaultLayout : DraftLayout;

  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home />}/>
        <Route path="/search" element={<Search />}/>
        <Route path="/practice" element={<Practice />}/>
        <Route path="/favorite" element={<Favorite />}/>
        <Route path="/history" element={<History />}/>
        <Route path="/mylist/:mylistId" element={<Mylist />}/>
        <Route path="/login" element={<Login />}/>
      </Route>
    </Routes>
  );
}