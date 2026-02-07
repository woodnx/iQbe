import {
  ActionIcon,
  AppShell,
  Center,
  Container,
  Drawer,
  Group,
  Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconActivity,
  IconBook,
  IconBooks,
  IconHistory,
  IconHome,
  IconMenu2,
  IconPencil,
  IconSchool,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useState } from "react";
import { useIsMobile } from "@/contexts/isMobile";
import UserInfoMenu from "@/features/user/components/UserInfoMenu";
import useHeaderHeight from "@/hooks/useHeaderHeight";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import Logo from "@/shared/components/Logo";
import NavbarLink from "@/shared/components/NavbarLink";
import { useMylists } from "../hooks/useMylists";
import { checkAuth } from "../plugins/auth";

const checkPathname = (pathname: string) => {
  if (pathname === "/") return "/";
  else if (pathname === "/search") return "/search";
  else if (pathname === "/practice") return "/practice";
  else if (pathname === "/favorite") return "/favorite";
  else if (pathname === "/history") return "/history";
  else if (pathname === "/setting") return "/setting";
  else if (pathname === "/create") return "/create";
  else if (pathname.includes("workbook")) return "/workbook";
  else if (pathname.includes("mylist")) return "/mylist";
  else return "";
};

export default function DefaultLayout() {
  const [activeLink, setActiveLink] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const { pathname } = useRouterState({
    select: (state) => state.location,
  });
  const { mylists } = useMylists(!loading);
  const { workbooks } = useWorkbooks(false, !loading);
  const isMobile = useIsMobile();
  const { headerHeight } = useHeaderHeight();

  const mockMylists = mylists?.map((m) => ({
    label: m.name,
    link: `${m.mid}`,
  }));

  const mockWorkbooks = workbooks?.map((w) => ({
    label: w.name,
    link: `${w.wid}`,
  }));

  const mockdata = [
    {
      label: "アクティビティ",
      icon: IconActivity,
      link: "/",
    },
    {
      label: "問題集",
      icon: IconBook,
      link: "/workbook",
      links: mockWorkbooks,
    },
    {
      label: "演習",
      icon: IconSchool,
      link: "/practice",
    },
    {
      label: "作問",
      icon: IconPencil,
      link: "/create",
    },
    {
      label: "お気に入り",
      icon: IconStar,
      link: "/favorite",
    },
    {
      label: "履歴",
      icon: IconHistory,
      link: "/history",
    },
    {
      label: "マイリスト",
      icon: IconBooks,
      link: "/mylist",
      isTab: true,
      links: [...(mockMylists || [])],
    },
  ];

  const activeIdx = mockdata.findIndex(
    (data) => checkPathname(pathname) === data.link,
  );

  useLayoutEffect(() => {
    let ignore = false;

    checkAuth().then((user) => {
      if (ignore) return;

      if (user == "please-move-welcome-page") {
        navigate({ to: "/welcome" });
        return;
      } else if (!user) {
        navigate({ to: "/login" });
        notifications.show({
          title: "Require Login",
          message: "Please login",
          color: "red",
          withBorder: true,
        });
        return;
      }
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const Navbar = () => (
    <AppShell.Navbar h="100%">
      <AppShell.Section grow p="md">
        <Group justify="space-between">
          <Logo horizonal width={100} mb="xs" />
        </Group>
        {mockdata.map((i, idx) => (
          <NavbarLink
            {...i}
            key={idx}
            isActive={activeIdx == idx}
            activeLink={activeLink}
            onNavigate={(link, linksIdx) => {
              navigate({ to: link });
              setActiveLink(
                linksIdx !== undefined
                  ? `${activeIdx}.${linksIdx}`
                  : `${activeIdx}`,
              );
              close();
            }}
            my={5}
          />
        ))}
      </AppShell.Section>
      <AppShell.Section p="md">
        <UserInfoMenu />
      </AppShell.Section>
    </AppShell.Navbar>
  );

  const Footer = () => (
    <AppShell.Footer withBorder={false}>
      <Group p="sm" justify="space-between" align="center">
        <ActionIcon
          size={70}
          radius="xl"
          variant="light"
          color="gray"
          onClick={open}
        >
          <IconMenu2 size="2rem" />
        </ActionIcon>
        <ActionIcon
          size={70}
          radius="xl"
          variant="light"
          color="gray"
          onClick={() => {
            setActiveLink("0");
            navigate({ to: "/" });
          }}
        >
          <IconHome size="2rem" />
        </ActionIcon>
        <ActionIcon
          size={70}
          radius="xl"
          variant="light"
          color="gray"
          onClick={() => {
            setActiveLink("1");
            navigate({ to: "/search" });
          }}
        >
          <IconSearch size="2rem" />
        </ActionIcon>
        <ActionIcon
          size={70}
          radius="xl"
          variant="light"
          color="gray"
          onClick={() => {
            setActiveLink("3");
            navigate({ to: "/practice", search: { isTransfer: false } });
          }}
        >
          <IconSchool size="2rem" />
        </ActionIcon>
      </Group>
    </AppShell.Footer>
  );

  return (
    <>
      {" "}
      {loading ? (
        <Center h="100vh">
          <Loader variant="dots" />
        </Center>
      ) : (
        <AppShell
          padding="md"
          layout="alt"
          navbar={{
            width: 250,
            breakpoint: "md",
          }}
          footer={{
            height: 90,
            collapsed: !isMobile,
          }}
          header={{
            height: headerHeight || 0,
          }}
        >
          {isMobile ? (
            <Drawer
              opened={opened}
              onClose={close}
              size={270}
              withCloseButton={false}
              pos="absolute"
            >
              <Drawer.Body p={0} m={0}>
                <Navbar />
              </Drawer.Body>
            </Drawer>
          ) : (
            <Navbar />
          )}

          <Footer />

          <AppShell.Main>
            <Container size="lg" px={0}>
              <Outlet />
            </Container>
          </AppShell.Main>
        </AppShell>
      )}{" "}
    </>
  );
}
