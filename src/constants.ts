// array con los programas que van a ser streameados

export interface Streamer {
  name: string;
  networks: {
    name: string;
    href: string;
    user: string;
    avatar: string;
  }[];
  isConductor: boolean;
}

export interface Program {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  image: string;
  streamers: Streamer[];
}

export const PROGRAMS: Program[] = [
  {
    title: "La trinchera",
    date: "Lunes a viernes",
    startTime: "09:00",
    endTime: "11:00",
    image: "/images/la-trinchera.webp",
    streamers: [
      {
        name: "Nicolás Promanzio",
        networks: [
          {
            name: "X",
            href: "https://x.com/nicpromanzio",
            user: "@nicpromanzio",
            avatar: "/images/streamers/nicolas.webp",
          },
        ],
        isConductor: true,
      },
    ],
  },
  {
    title: "La Fuerza",
    date: "Lunes a viernes",
    startTime: "11:00",
    endTime: "13:00",
    image: "/images/la-fuerza.webp",
    streamers: [
      {
        name: "",
        networks: [],
        isConductor: true,
      },
    ],
  },
  {
    title: "Estado de sitio",
    date: "Miercoles y Viernes",
    startTime: "17:00",
    endTime: "19:00",
    image: "/images/estado-de-sitio.webp",
    streamers: [
      {
        name: "",
        networks: [],
        isConductor: true,
      },
    ],
  },
  {
    title: "Alta suciedad",
    date: "Lunes, Miercoles y Viernes",
    startTime: "19:00",
    endTime: "21:00",
    image: "/images/alta-suciedad.webp",
    streamers: [
      {
        name: "Piro",
        networks: [
          {
            name: "X",
            href: "https://x.com/piroabrazo",
            user: "@piroabrazo",
            avatar: "/images/streamers/piro.webp",
          },
        ],
        isConductor: true,
      },
    ],
  },
  {
    title: "La Misa",
    date: "Lunes a viernes",
    startTime: "21:00",
    endTime: "23:00",
    image: "/images/la-misa.webp",
    streamers: [
      {
        name: "El Gordo Dan",
        networks: [
          {
            name: "X",
            href: "https://x.com/GordoDan_",
            user: "@GordoDan_",
            avatar: "/images/streamers/el-gordo-dan.webp",
          },
        ],
        isConductor: true,
      },
    ],
  },
];
