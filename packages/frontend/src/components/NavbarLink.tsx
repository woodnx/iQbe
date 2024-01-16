import React, { useState } from "react";
import { Box, BoxProps, Collapse, Text, ThemeIcon, UnstyledButton, rem, ScrollArea, Group } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./styles/NavbarLink.module.css";

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
) & BoxProps;

interface LinkProps extends BoxProps {
  label: string,
  link: string,
  isActive: boolean,
  onClick: () => void,
}

function Link({
  label,
  link,
  onClick,
  isActive,
  ...others
}: LinkProps) {
  return (
    <Text<'a'>
      {...others}
      className={classes.link}
      data-active={isActive || undefined}
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
        className={classes.control} 
        data-active={(isActive && activeNestedLink == undefined && (!links || !isTab)) || undefined}
        {...others}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="transparent" color="black" size={30}>
              <Icon className={classes.linkIcon} style={{ width: rem(20), height: rem(20) }}/>
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
        </Group>
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