import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import './App.css';
import Generator from './pages/Generator';
import Editor from './pages/Editor';

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
      <TopNav>
        <StyledNavButton selected={route === 'Generator'} onClick={() => navigate('Generator')}>Gerador</StyledNavButton>
        <StyledNavButton selected={route === 'Editor'} onClick={() => navigate('Editor')}>Editor</StyledNavButton>
      </TopNav>
      <BodyCard>
        <div className="inner-main">
          <div className="title-div">
            <img src="./assets/images/brasao.png" alt="" />
            <h1>Gerador de Escalas</h1>
          </div>
          <div className="screen-body">
            <Router />
          </div>
        </div>
      </BodyCard>
    </AppBody>
  )
}

interface StyledNavButtonProps {
  selected?: boolean;
}

const StyledNavButton = styled.span<StyledNavButtonProps>`
  padding: .4rem .7rem;
  background-color: ${(props) => props.selected ? '#57964f' : '#afafaf'};
  transition: background-color 200ms;
  font-weight: bold;
  user-select: none;
  cursor: pointer;
  margin: 0;
  border-top-right-radius: .4rem;
  ${lineBorder('#a3a3a3')}
`;

const AppBody = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BodyCard = styled.main`
  ${lineBorder('#bebebe')}
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  border-top-left-radius: 0;
  background-image: linear-gradient(140deg, #6aa04b, #b9d1b4);
`;

function lineBorder(color: string) {
  return css`
    border-width: 1px;
    border-style: solid;
    border-color: ${color};
  `;
}

const TopNav = styled.nav`
  display: flex;
  color: #000000;
  gap: .2rem;
`;