import type { AppProps } from "next/app";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;
    color: #111;
    background: #fdfbf7;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
