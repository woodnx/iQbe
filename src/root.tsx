import { Route, Routes } from "react-router-dom"
import { AppShell, Group, NavLink, Navbar, ThemeIcon, createStyles } from "@mantine/core"
import { 
  IconActivity, 
  IconHistory, 
  IconSchool, 
  IconSearch, 
  IconStar 
} from "@tabler/icons-react"
import Home from "./routers/home"
import { useState } from "react"
import { useMediaQuery } from "@mantine/hooks"

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

function Root() {
  const [ active, setActive ] = useState(0)
  const { classes } = useStyles()
  const matches = useMediaQuery('(min-width: 48em)')

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
      <Routes>
        <Route path="/" element={<Home />}/>
      </Routes>
    </AppShell>
  )
}

export default Root
