import { useLayoutEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ActionIcon, AppShell, Center, Container, Drawer, Footer, Group, Loader, NavLink, Navbar, ThemeIcon, createStyles, getStylesRef } from "@mantine/core";
import { IconActivity, IconHistory, IconHome, IconList, IconMenu2, IconSchool, IconSearch, IconStar } from "@tabler/icons-react";
import { useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import useUserStore from "../store/user";
import UserLogoutButton from "../components/UserLogoutButton";
import { useMylistInfomations } from "../hooks/useMylists";
import Logo from "../components/Logo";
import { checkAuth } from "../plugins/auth";

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
    label: 'Favorite',
    icon: IconStar,
    link: '/favorite',
  },
  {
    label: 'History',
    icon: IconHistory,
    link: '/history',
  },
];

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
  },
  linkIcon: {
    ref: getStylesRef('icon'),
    color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
  },
  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
      [`& .${getStylesRef('icon')}`]: {
        color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
      },
    },
  },
}));

export default function DefaultLayout() {
  const [ active, setActive ] = useState(0);
  const [ loading, setLoading ] = useState(true);
  const { classes } = useStyles();
  const matches = useMediaQuery('(min-width: 48em)');
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setUserData = useUserStore((state) => state.setUserData);
  const { mylists } = useMylistInfomations(!loading);
  
  useLayoutEffect(() => {
    let ignore = false;
    setActive(mockdata.findIndex((data) => data.link === location.pathname));

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
      // authStateChanged();
    }
  }, []);

  const items = mockdata.map((item, index) => {
    const icon = (
      <ThemeIcon variant="subtile">
        <item.icon size="1.25rem" stroke={1.5} />
      </ThemeIcon>
    );

    return (
      <NavLink
        component={Link}
        classNames={{root: classes.link}}
        key={item.label}
        active={index === active}
        label={item.label}
        icon={icon}
        to={item.link}
        onClick={() => { 
          setActive(index);
          close();
        }}
      >
      </NavLink>
    );
  });

  const mylistLinks = mylists?.map((mylist, idx) => {
    return (
      <NavLink
        component={Link}
        classNames={{root: classes.link}}
        key={mylist.mid}
        active={idx + mockdata.length === active}
        label={mylist.name}
        icon={<IconList/>}
        to={`mylist/${mylist.mid}`}
        onClick={() => { 
          setActive(idx + mockdata.length);
          close();
        }}
      />
    );
  });

  const navbar = (
    <Navbar 
      p="md" 
      width={{xs: 250}} 
      hidden
      hiddenBreakpoint="sm"
    >
      <Navbar.Section grow>
        <Group position="apart">
          <Logo horizonal width={100} mb="xs"/>
        </Group>
        {items}
        {mylistLinks}
      </Navbar.Section>
      <Navbar.Section>
        <UserLogoutButton/>
      </Navbar.Section>
    </Navbar>
  );

  const footer = (
  <>
    <Footer 
      height={100}
      withBorder={false}
      left={-1}
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
            setActive(0); 
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
            setActive(1); 
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
            setActive(2); 
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
    <>
    {loading ? 
      <Center h="100vh">
        <Loader variant="dots"/>
      </Center>
    :
      <AppShell
        pt={2}
        layout="alt"
        navbar={navbar}
        footer={!matches ? footer : <></>}
        navbarOffsetBreakpoint="sm"
      >
        <Drawer 
          opened={opened} 
          onClose={close} 
          size={240}
          title={<Logo horizonal width={90}/>}
          withCloseButton={false}
          pos="absolute"
          left="-1px" 
        >
          <Drawer.Body p={0}>
            <Navbar p="md">
              <Navbar.Section grow>
                <Group position="apart">
                  <Logo horizonal width={100} mb="xs"/>
                </Group>
                {items}
                {mylistLinks}
              </Navbar.Section>
              <Navbar.Section>
                <UserLogoutButton/>
              </Navbar.Section>
            </Navbar>
          </Drawer.Body>
        </Drawer>
        <Container size="lg" px={0}>
          <Outlet/>
        </Container>
      </AppShell>
    }
    </>
  );
}