import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import './App.css';
import Generator from './pages/Generator';
import Editor from './pages/Editor';
import { AppBody, TopNav, StyledNavButton, BodyCard } from './App.styles';

type RouteCallback = () => React.JSX.Element;

function NotFound() {
  return <div>Not Found</div>
}

type RoutesType = {
  [K in string]: RouteCallback | undefined;
};

function useRoutes<R extends RoutesType, IR extends keyof R>(routes: R, initialRoute: IR) {
  const [route, setRoute] = useState<keyof R>(initialRoute);

  const Router = routes[route] ?? NotFound;

  function navigate<K extends keyof R>(route: K) {
    setRoute(route);
  }

  return {
    route,
    navigate,
    Router,
  };
}

function createRoutes<R extends RoutesType>(routes: R): R {
  return routes;
}

const AppRoutes = createRoutes({
  Generator,
  Editor,
});

export default function App() {
  const { Router, navigate, route } = useRoutes(AppRoutes, 'Generator');

  return (
    <AppBody>
      <div className="title-div">
        <img src="./assets/images/brasao.png" alt="" />
        <h1>Gerador de Escalas</h1>
      </div>
      <TopNav>
        <StyledNavButton selected={route === 'Generator'} onClick={() => navigate('Generator')}>Gerador</StyledNavButton>
        <StyledNavButton selected={route === 'Editor'} onClick={() => navigate('Editor')}>Editor</StyledNavButton>
      </TopNav>
      <BodyCard>
        <Router />
      </BodyCard>
    </AppBody>
  )
}