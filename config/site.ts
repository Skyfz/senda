import { sign } from "crypto";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Senda",
  description: "Send and receive money instantly.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Account",
      href: "/account",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "#",
      color: "danger"
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "/docs",
    signIn: "/signin",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
