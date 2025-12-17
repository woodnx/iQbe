import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import DefaultLayout from "@/layouts/default";
import DraftLayout from "@/layouts/draft";

const defineTitle = (pathname: string) => {
  if (pathname === "/") return "ホーム";
  else if (pathname === "/search") return "検索";
  else if (pathname === "/practice") return "演習";
  else if (pathname === "/favorite") return "お気に入り";
  else if (pathname === "/history") return "履歴";
  else if (pathname === "/setting") return "設定";
  else if (pathname === "/create") return "作問";
  else if (pathname.includes("workbook")) return "問題集";
  else if (pathname.includes("mylist")) return "マイリスト";
  else if (pathname === "/login") return "ログイン";
  else if (pathname === "/reset-password") return "パスワードリセット";
  else if (pathname === "/welcome") return "ようこそ！";
  else return "";
};

const requireDraftLayoutPages = ["/login", "/reset-password", "/welcome"];

export default function Root() {
  const location = useRouterState({
    select: (state) => state.location,
  });

  const pathname = location.pathname;
  const requiredLogin = !requireDraftLayoutPages.includes(pathname);
  const Layout = requiredLogin ? DefaultLayout : DraftLayout;

  useEffect(() => {
    document.title = `${defineTitle(pathname)} | iQbe`;
  }, [pathname]);

  return <Layout />;
}
