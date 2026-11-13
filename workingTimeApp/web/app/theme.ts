"use client";

import { createTheme } from "@mui/material/styles";

// アプリ全体の色・フォントなどをここで決める
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: "#1976d2" },
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
  },
});

export default theme;
