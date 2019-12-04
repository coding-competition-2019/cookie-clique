import * as React from 'react';
import App from 'next/app';
import { getTokens } from '@kiwicom/orbit-components';
import { ThemeProvider, createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    width: 100vw;
    height: 100vh;
    margin: 0 auto;
    background-color: ${({ theme }) => theme.orbit.paletteCloudLight};
  }
`;

const tokens = getTokens();

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={{ orbit: tokens }}>
        <>
          <GlobalStyle />
          <link
            href="https://api.tiles.mapbox.com/mapbox-gl-js/v1.5.0/mapbox-gl.css"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,400i,500,500i,700"
            rel="stylesheet"
          />
          <Component {...pageProps} />
        </>
      </ThemeProvider>
    );
  }
}
