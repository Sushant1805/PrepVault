"use client";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "light",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#151515", // ✅ your global color
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          margin: 0,
        },
      },
    },
  },
});

export default function MuiProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Now uses your overrides */}
      {children}
    </ThemeProvider>
  );
}
