import { extendTheme } from "@chakra-ui/react";

const main = "#0B374D";
const accent = "#E14033";
export const Colors = {
  base: "#EBE0CE",
  baseLight: "#F3EDE2",
  baseAccent: "#D7D165",
  main: main,
  mainLight: "#545F64",
  accent: accent,
  link: "#127CAE",
  linkHover: "#0092D8",
  lightGray: "#BFC6C9",

  secondary: "#7C757D",

  dark: "#343A40",

  textDefault: "#212529",
  textAccent: accent,
  textMuted: "#828282",

  backgroundColor: "#F9F9F9",

  border: "#DFDFDF",

  nameHighlightOrgz: { bg: "#BD4848", fg: "#FFFFFF" },
  nameHighlightCore: { bg: "#74439B", fg: "#FFFFFF" },
  nameHighlightSpeaker: { bg: "#D7D165", fg: main },

  nameSpeaker: main, // TODO:
  nameCore: "#74439B",

  defaultAvatarBg: "#868E96", // TODO:
};

export const theme = extendTheme({
  fonts: {
    heading: "Titillium Web",
    body: "Roboto",
  },
  styles: {
    global: {
      body: {
        color: Colors.textDefault,
        backgroundColor: Colors.backgroundColor,
      },
    },
  },
  components: {
    Tabs: {
      variants: {
        "rk-tracks": (_props) => {
          return {
            tablist: {
              borderBottom: "1px solid",
              borderColor: Colors.border,
              backgroundColor: "#FFFFFF",
            },
            tab: {
              backgroundColor: "#FFFFFF",
              color: Colors.textMuted,
              fontWeight: 400,
              "& .rk-tracks-tabs-name": {
                borderBottom: "1px solid",
                borderColor: "transparent",
              },
              _selected: {
                color: main,
                "& .rk-tracks-tabs-name": {
                  borderColor: main,
                  fontWeight: 700,
                },
              },
              //_active: {
              //  bg: main,
              //},
              //_disabled: {
              //  opacity: 0.4,
              //  cursor: "not-allowed",
              //},
            },
          };
        },
      },
    },
  },
});
