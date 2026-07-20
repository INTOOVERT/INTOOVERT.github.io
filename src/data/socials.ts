export interface Social {
  label: string;
  handle: string;
  href: string;
  /** simple inline svg icon key */
  icon: "artstation" | "instagram" | "linkedin" | "github" | "mail";
}

export const socials: Social[] = [
  {
    label: "ArtStation",
    handle: "artstation.com/intoovert",
    href: "https://www.artstation.com/intoovert",
    icon: "artstation",
  },
  {
    label: "Instagram",
    handle: "instagram.com/intoovert",
    href: "https://www.instagram.com/intoovert/",
    icon: "instagram",
  },
  {
    label: "LinkedIn",
    handle: "linkedin.com/in/muhtasim-khan-shreshtho-51ab7440a",
    href: "https://www.linkedin.com/in/muhtasim-khan-shreshtho-51ab7440a",
    icon: "linkedin",
  },
  {
    label: "GitHub",
    handle: "github.com/INTOOVERT",
    href: "https://github.com/INTOOVERT/",
    icon: "github",
  },
  {
    label: "Email",
    handle: "intoovert@gmail.com",
    href: "mailto:intoovert@gmail.com",
    icon: "mail",
  },
];

export const FIVERR_URL = "https://www.fiverr.com/cgrawr";
