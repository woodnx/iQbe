import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import DefaultLayout from '@/layouts/default';
import DraftLayout from '@/layouts/draft';
import Create from '@/pages/create';
import Error from '@/pages/error';
import Favorite from '@/pages/favorite';
import History from '@/pages/history';
import Home from '@/pages/home';
import Login from '@/pages/login';
import Mylist from '@/pages/mylists';
import Practice from '@/pages/practice';
import ResetPassword from '@/pages/reset-password';
import Search from '@/pages/search';
import Setting from '@/pages/setting';
import Welcome from '@/pages/welcome';
import Workbooks from '@/pages/workbook';

const defineTitle = (pathname: string) => {
  if (pathname === '/') return 'ホーム';
  else if (pathname === '/search') return '検索';
  else if (pathname === '/practice') return '演習';
  else if (pathname === '/favorite') return 'お気に入り';
  else if (pathname === '/history') return '履歴';
  else if (pathname === '/setting') return '設定';
  else if (pathname === '/create') return '作問';
  else if (pathname.includes('workbook')) return '問題集';
  else if (pathname.includes('mylist')) return 'マイリスト';
  else if (pathname === '/login') return 'ログイン';
  else if (pathname === '/reset-password') return 'パスワードリセット';
  else if (pathname === '/welcome') return 'ようこそ！';
  else return '';
}

const requireDraftLayoutPages = [
  '/login',
  '/reset-password',
  '/welcome',
];

export default function Root() {
  const location = useLocation();
  const requiredLogin = !requireDraftLayoutPages.includes(location.pathname);
  const Layout = requiredLogin ? DefaultLayout : DraftLayout;

  useEffect(() => {
    document.title = `${defineTitle(location.pathname)} | iQbe`;
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home />}/>
        <Route path="/welcome" element={<Welcome />}/>
        <Route path="/search" element={<Search />}/>
        <Route path="/practice" element={<Practice />}/>
        <Route path="/favorite" element={<Favorite />}/>
        <Route path="/history" element={<History />}/>
        <Route path="/create" element={<Create />}/>
        <Route path="/mylist/:mid" element={<Mylist />}/>
        <Route path="/workbook/:wid?" element={<Workbooks />}/>
        <Route path="/setting" element={<Setting />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  );
}