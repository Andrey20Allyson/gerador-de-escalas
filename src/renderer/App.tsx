import { AssetsErrorCode } from '../app/api/assets.error';
import React, { useState } from 'react';
import './App.css';
import { AppBody, BodyCard, StyledNavButton, TopNav } from './App.styles';
import { Providers } from './Providers';
import { AppError } from './api';
import { useLoading } from './hooks';
import { useServiceUnlocker } from './hooks/useServiceUnlocker';
import Configuration from './pages/Configuration';
import Editor from './pages/Editor';
import UnlockPage from './pages/Unlock';

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
  Editor,
  Configuration,
});

export default function App() {
  const { Router, navigate, route } = useRoutes(AppRoutes, 'Editor');
  const services = useServiceUnlocker();
  const { listen, loading } = useLoading();

  async function handleUnlock(password: string) {
    await listen(services.unlock(password));
  }

  function getPasswordError() {
    if (services.error === undefined) return;
    
    if (services.error.code === AssetsErrorCode.INCORRECT_PASSWORD) {
      return true;
    }

    AppError.log(services.error);
  }

  return (
    <Providers>
      <AppBody>
        <TopNav>
          {/* <StyledNavButton selected={route === 'Generator'} onClick={() => navigate('Generator')}>Gerador</StyledNavButton> */}
          <StyledNavButton selected={route === 'Editor'} onClick={() => navigate('Editor')}>Editor</StyledNavButton>
          <StyledNavButton selected={route === 'Configuration'} onClick={() => navigate('Configuration')}>Configurações</StyledNavButton>
        </TopNav>
        <BodyCard>
          {services.isLocked ? <UnlockPage isLoading={loading} hasPasswordError={getPasswordError()} onSubmit={handleUnlock} /> : <Router />}
        </BodyCard>
      </AppBody>
    </Providers>
  )
}