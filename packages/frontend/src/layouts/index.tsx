import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Search from "@/pages/search";
import Practice from "@/pages/practice";
import Favorite from "@/pages/favorite";
import DefaultLayout from "@/layouts/default";
import DraftLayout from "@/layouts/draft";
import History from "@/pages/history";
import Mylist from "@/pages/mylists";
import ResetPassword from "@/pages/reset-password"
import Error from "@/pages/error";

const defineTitle = (pathname: string) => {
  if (pathname === '/') return 'Home';
  else if (pathname === '/search') return 'Search';
  else if (pathname === '/practice') return 'Practice';
  else if (pathname === '/favorite') return 'Favorite';
  else if (pathname === '/history') return 'History';
  else if (pathname.includes('mylist')) return 'Mylist';
  else if (pathname === '/login') return 'Login';
  else if (pathname === '/reset-password') return 'Reset password';
  else return '';
}

const requireDraftLayoutPages = [
  '/login',
  '/reset-password'
];

export default function Root() {
  const location = useLocation();
  const requiredLogin = !requireDraftLayoutPages.includes(location.pathname);
  const Layout = requiredLogin ? DefaultLayout : DraftLayout;

  // const modal = () => modals.openConfirmModal({
  //   title: 'Reset Password',
  //   children: 
  //   <Text>
  //     パスワード再設定
  //   </Text>,
  //   labels: {
  //     confirm: 'Confirm',
  //     cancel: 'Cancel'
  //   }
  // })

  useEffect(() => {
    document.title = `${defineTitle(location.pathname)} | iQbe`;
  }, [location]);

  // useEffect(() => {
  //   if (location.pathname === '/reset-password' && !searchParams.get('token')) {
  //     navigate('/');
  //     modal();
  //   }
  // }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home />}/>
        <Route path="/search" element={<Search />}/>
        <Route path="/practice" element={<Practice />}/>
        <Route path="/favorite" element={<Favorite />}/>
        <Route path="/history" element={<History />}/>
        <Route path="/mylist/:mid" element={<Mylist />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}