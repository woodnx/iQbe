import { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ActionIcon, AppShell, Center, Container, Drawer, Footer, Group, Loader, Navbar } from "@mantine/core";
import { IconActivity, IconHistory, IconHome, IconMenu2, IconPencil, IconSchool, IconSearch, IconStar } from "@tabler/icons-react";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import useUserStore from "../store/user";
import UserLogoutButton from "../components/UserLogoutButton";
import { useMylistInfomations } from "../hooks/useMylists";
import Logo from "../components/Logo";
import { checkAuth } from "../plugins/auth";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import NavbarLink from "@/components/NavbarLink";
import { IconBooks } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

const checkPathname = (pathname: string) => {
  if (pathname === '/') return '/';
  else if (pathname === '/search') return '/search';
  else if (pathname === '/practice') return '/practice';
  else if (pathname === '/favorite') return '/favorite';
  else if (pathname === '/history') return '/history';
  else if (pathname.includes('create')) return '/create';
  else if (pathname.includes('mylist')) return '/mylist';
  else return '';
}

export default function DefaultLayout() {
  const [ activeLink, setActiveLink ] = useState<string>("0");
  const [ loading, setLoading ] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setUserData = useUserStore((state) => state.setUserData);
  const { mylists } = useMylistInfomations(!loading);
  const { workbooks } = useWorkbooks(!loading);
  const isMobile = useIsMobile();

  const mockMylists = mylists?.map(m => ({
    label: m.name,
    link: `${m.mid}`
  }));

  const mockWorkbooks = workbooks?.map(w => ({
    label: w.name,
    link: `${w.wid}`
  }));

  const mockdata = [
    { 
      label: 'Activity',
      icon: IconActivity,
      link: '/',
    },
    {
      label: 'Search',
      icon: IconSearch,
      link: '/search',
    },
    {
      label: 'Practice',
      icon: IconSchool,
      link: '/practice',
    },
    {
      label: 'Create',
      icon: IconPencil,
      link: '/create',
      links: [
        {
          label: 'すべてのクイズ',
          link: 'all',
        },
        ...mockWorkbooks || [],
      ]
    },
    {
      label: 'Favorite',
      icon: IconStar,
      link: '/favorite'
    },
    {
      label: 'History',
      icon: IconHistory,
      link: '/history'
    },
    {
      label: 'もっとみる',
      icon: IconBooks,
      link: '/mylist',
      isTab: true,
      links: [
        ...mockMylists || [],
      ]
    },
  ];

  const activeIdx = mockdata.findIndex((data) => checkPathname(location.pathname) === data.link);
  
  useLayoutEffect(() => {
    let ignore = false;

    checkAuth()
    .then((user) => {
      if (ignore) return;
      if (!user) {
        navigate('/login') 
        notifications.show({
          title: 'Require Login',
          message: 'Please login',
          color: 'red',
          withBorder: true,
        });
        return;
      }
      setLoading(false);
      setUserData(user);
    });
    return () => {
      ignore = true;
    }
  }, []);

  const MyNavbarSections = () => (
    <>
      <Navbar.Section grow>
        <Group position="apart">
          <Logo horizonal width={100} mb="xs"/>
        </Group>
        {
          mockdata.map((i,idx) => 
            <NavbarLink 
              {...i} 
              key={idx} 
              isActive={activeIdx == idx}
              activeLink={activeLink}
              onNavigate={(link, linksIdx) => {
                navigate(link);
                setActiveLink(linksIdx !== undefined ? `${activeIdx}.${linksIdx}` : `${activeIdx}`);
                close();
              }}
              my={5}
            />
          )
        }
      </Navbar.Section>
      <Navbar.Section>
        <UserLogoutButton/>
      </Navbar.Section>
    </>
  );

  const footer = (
  <>
    <Footer 
      height={100}
      withBorder={false}
    >
      <Group 
        p="sm"
        position="apart" 
        align="center"
      >
        <ActionIcon 
          size={70} 
          radius="xl"
          variant="light"
          onClick={open}
        >
          <IconMenu2 size="2rem"/>
        </ActionIcon>
        <ActionIcon 
          size={70} 
          radius="xl"
          variant="light"
          onClick={() => {
            setActiveLink("0"); 
            navigate('/');
          }}
        >
          <IconHome size="2rem"/>
        </ActionIcon>
        <ActionIcon 
          size={70} 
          radius="xl"
          variant="light"
          onClick={() => {
            setActiveLink("1"); 
            navigate('/search');
          }}
        >
          <IconSearch size="2rem"/>
        </ActionIcon>
        <ActionIcon 
          size={70} 
          radius="xl"
          variant="light"
          onClick={() => {
            setActiveLink("3"); 
            navigate('/practice');
          }}
        >
          <IconSchool size="2rem"/>
        </ActionIcon>
      </Group>
    </Footer>
  </>
  )

  return (
    <> {
    loading 
    ? 
      <Center h="100vh">
        <Loader variant="dots"/>
      </Center>
    :
      <AppShell
        pt={2}
        layout="alt"
        navbar={
          <Navbar 
            p="md" 
            width={{xs: 250}}
            hidden={isMobile}
          >
            <MyNavbarSections/>
          </Navbar>
        }
        footer={isMobile ? footer : <></>}
        navbarOffsetBreakpoint="sm"
      >
        <Drawer 
          opened={opened} 
          onClose={close} 
          size={240}
          title={<Logo horizonal width={90}/>}
          withCloseButton={false}
          pos="absolute"
        >
          <Drawer.Body p={0}>
            <Navbar p="md">
              <MyNavbarSections/>
            </Navbar>
          </Drawer.Body>
        </Drawer>
        <Container size="lg" px={0}>
          <Outlet/>
        </Container>
      </AppShell>
    } </>
  );
}