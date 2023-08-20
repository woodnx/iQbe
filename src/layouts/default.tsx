import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useLayoutEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { AppShell, Center, Group, Loader, NavLink, Navbar, ThemeIcon, createStyles } from "@mantine/core"
import { IconActivity, IconHistory, IconSchool, IconSearch, IconStar } from "@tabler/icons-react"
import { useState } from "react"
import { useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import useUserStore from "../store/user"
import LogoutButton from "../components/LogoutButton"

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
]

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
  }
}))

export default function DefaultLayout() {
  const [ active, setActive ] = useState(0)
  const [ loading, setLoading ] = useState(true)
  const { classes } = useStyles()
  const matches = useMediaQuery('(min-width: 48em)')
  const navigate = useNavigate()
  const location = useLocation()
  const setIdToken = useUserStore((state) => state.setIdToken)
  const auth = getAuth()
  
  useLayoutEffect(() => {
    let ignore = false
    setActive(mockdata.findIndex((data) => data.link === location.pathname))

    const authStateChanged = onAuthStateChanged(auth, async (user) => {
      if (ignore) return
      if (!user) { 
        navigate('/login') 
        notifications.show({
          title: 'Require Login',
          message: 'Please login',
          color: 'red',
          withBorder: true,
        })
        return 
      }
      await setIdToken()
      setLoading(false)
    })
    return () => {
      ignore = true
      authStateChanged()
    }
  }, [])

  const items = mockdata.map((item, index) => {
    const icon = (
      <ThemeIcon variant="light">
        <item.icon size="1rem" stroke={1.5} />
      </ThemeIcon>
    )

    return (
      <NavLink
        component={Link}
        classNames={{root: classes.link}}
        key={item.label}
        active={index === active}
        label={item.label}
        icon={icon}
        to={item.link}
        onClick={() => setActive(index)}
      >
      </NavLink>
    )
  })

  const navbar = (
    <Navbar 
      p="md" 
      width={{xs: 250}} 
      hidden={!matches}
    >
      <Navbar.Section grow>
        <Group position="apart">
          
        </Group>
        {items}
      </Navbar.Section>
      <Navbar.Section>
        <LogoutButton/>
      </Navbar.Section>
    </Navbar>
  )

  return (
    <>
    {loading ? 
      <Center h="100vh">
        <Loader variant="dots"/>
      </Center>
    :
      <AppShell
        padding="md"
        layout="alt"
        navbar={navbar}
        navbarOffsetBreakpoint="sm"
      >
        <Outlet/>
      </AppShell>
    }
    </>
    
  )
}