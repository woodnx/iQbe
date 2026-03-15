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
  IconBooks,
  IconDashboard,
  IconHome,
  IconMenu2,
  IconPencil,
  IconSchool,
  IconSearch,
} from "@tabler/icons-react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useState } from "react";
import { useIsMobile } from "@/contexts/isMobile";
import UserInfoMenu from "@/features/user/components/UserInfoMenu";
import useHeaderHeight from "@/hooks/useHeaderHeight";
import Logo from "@/shared/components/Logo";
import NavbarLink from "@/shared/components/NavbarLink";
import { checkAuth } from "../plugins/auth";

const checkPathname = (pathname: string) => {
  if (pathname === "/") return "/";
  else if (pathname === "/library") return "/library";
  else if (pathname === "/training") return "/training";
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
  const isMobile = useIsMobile();
  const { headerHeight } = useHeaderHeight();

  const mockdata = [
    {
      label: "ダッシュボード",
      icon: IconDashboard,
      link: "/",
    },

    {
      label: "演習",
      icon: IconSchool,
      link: "/training",
    },
    {
      label: "作問",
      icon: IconPencil,
      link: "/create",
    },
    {
      label: "ライブラリ",
      icon: IconBooks,
      link: "/library",
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

          <AppShell.Main bg="#F2F3F4">
            <Container size="md" px={0}>
              <Outlet />
            </Container>
          </AppShell.Main>
        </AppShell>
      )}{" "}
    </>
  );
}
