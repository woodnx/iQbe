import { getAuth, getIdToken, onAuthStateChanged } from "firebase/auth"
import { ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppShell, Group, NavLink, Navbar, ThemeIcon, createStyles } from "@mantine/core"
import { IconActivity, IconHistory, IconSchool, IconSearch, IconStar } from "@tabler/icons-react"
import { useState } from "react"
import { useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import useUserStore from "../store/user"

export type LayoutProps = {
  children: ReactNode
}

const mockdata = [
  { 
    label: 'Activity',
    icon: IconActivity,
    link: '/',
  },
  {
    label: 'Search',
    icon: IconSearch,
    link: '/',
  },
  {
    label: 'Practice',
    icon: IconSchool,
    link: '/',
  },
  {
    label: 'Favorite',
    icon: IconStar,
    link: '/',
  },
  {
    label: 'History',
    icon: IconHistory,
    link: '/',
  },
]

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
  }
}))

export default function DefaultLayout({ children }: LayoutProps) {
  const [ active, setActive ] = useState(0)
  const setIdToken = useUserStore((state) => state.setIdToken)
  const { classes } = useStyles()
  const matches = useMediaQuery('(min-width: 48em)')
  const navigate = useNavigate()
  const auth = getAuth()

  useEffect(() => {
    let ignore = false
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
      const idToken = await getIdToken(user, true)
      setIdToken(idToken)
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
        classNames={{root: classes.link}}
        key={item.label}
        active={index === active}
        label={item.label}
        icon={icon}
        onClick={() => setActive(index)}
      />
    )
  })

  const navbar = (
    <Navbar width={{xs: 250}} p="md" hidden={!matches}>
      <Navbar.Section >
        <Group position="apart">
          
        </Group>
        {items}
      </Navbar.Section>
    </Navbar>
  )

  return (
    <AppShell
      padding="md"
      navbar={navbar}
      navbarOffsetBreakpoint="sm"
    >
      {children}
    </AppShell>
  )
}