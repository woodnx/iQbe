import { Box, Collapse, Text, ThemeIcon, UnstyledButton, rem, createStyles, getStylesRef, DefaultProps, Flex, ScrollArea } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import React, { useState } from "react";

type NavbarLinkProps = {
  icon: React.FC<any>,
  label: string,
  link: string,
  links?: { label: string; link: string }[],
  isActive: boolean,
  isTab?: boolean,
  activeLink: string,
  onNavigate?: (link: string, linksIdx?: number) => void;
  onOpen?: () => void,
} & (
  | { link?: string; links?: { label: string; link: string }[] }
) & DefaultProps;

interface LinkProps extends DefaultProps {
  label: string,
  link: string,
  isActive: boolean,
  onClick: () => void,
}

const useStyles = createStyles((theme) => ({
  control: {
    fontWeight: 500,
    display: 'block',
    width: '100%',
    padding: `8px ${theme.spacing.md}`,
    color: theme.colorScheme,
    fontSize: theme.fontSizes.md,
    borderRadius: theme.radius.lg,
    '&:hover': {
      backgroundColor: theme.colors.gray[0],
      color: theme.black,
    },
  },
  link: {
    fontWeight: 500,
    display: 'block',
    TextDecoration: 'none',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    paddingLeft: theme.spacing.md,
    marginLeft: theme.spacing.xl,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[7],
    borderLeft: `1px solid ${theme.colors.gray[3]}`,
    '&:hover': {
      backgroundColor: theme.colors.gray[0],
      color: theme.black,
    },
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
  chevron: {
    transition: `transform 200ms ease`,
  }
}));

function Link({
  label,
  link,
  onClick,
  isActive,
  ...others
}: LinkProps) {
  const { classes, cx } = useStyles();
  return (
    <Text<'a'>
      {...others}
      className={cx(classes.link, isActive ? classes.linkActive : null)}
      component="a"
      href={link}
      key={label}
      onClick={(e) => { 
        e.preventDefault();
        onClick();
      }}
    >
      {label}
    </Text>
  );
}

export default function ({
  icon: Icon,
  label,
  link,
  links,
  isActive,
  isTab = false,
  activeLink,
  onNavigate = () => {},
  onOpen = () => {},
  ...others
}: NavbarLinkProps) {
  const [ opened, setOpened ] = useState(isActive);
  const { classes, cx } = useStyles();
  const activeNestedLink = !!activeLink ? activeLink.split('.')[1] : undefined;
  
  const to = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!!links) {
      setOpened(v => !v);
      onOpen();
    }
    if (!isTab) {
      onNavigate(link);
    }
  }

  return (
    <>
      <UnstyledButton
        onClick={(e) => to(e)} 
        className={cx(classes.control, (isActive && activeNestedLink == undefined && (!links || !isTab)) ? classes.linkActive : null)} 
        {...others}
      >
        <Flex justify="space-between" align="center" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="subtile" size={32}>
              <Icon style={{ width: rem(20), height: rem(20) }}/>
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {
            links && (
              <IconChevronRight
                className={classes.chevron}
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  transform: opened ? 'rotate(-90deg)' : 'none',
                }}
              />
            )
          }
        </Flex>
      </UnstyledButton>
      {links ? 
        <Collapse 
          in={opened}
        >
          <ScrollArea.Autosize mah={200}>
          {
            (links || []).map((l, idx) => 
              <Link 
                {...l}
                key={idx}
                isActive={isActive && Number(activeNestedLink) == idx}
                onClick={() => { 
                  onNavigate(`${link}/${l.link}`, idx);
                }}
              />
            )
          }
          </ScrollArea.Autosize>
        </Collapse> : null}
    </>
  );
}