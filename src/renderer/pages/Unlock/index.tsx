import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import styled from "styled-components";

export interface UnlockPageProps {
  hasPasswordError?: boolean;
  onSubmit?: (password: string) => void;
}

export default function UnlockPage(props: UnlockPageProps) {
  const {
    onSubmit,
    hasPasswordError = false,
  } = props;

  const [password, setPassword] = useState('');

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    setPassword(ev.currentTarget.value);
  }

  function submit() {
    onSubmit?.(password);
  }

  function handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Enter') {
      submit();
    }
  }

  return (
    <StyledUnlockPage>
      <h1 className="title">Bem Vindo</h1>
      <label>
        Senha:
        <input type="password" onChange={handleChange} onKeyDown={handleKeyDown} />
      </label>
      {hasPasswordError && <small className="error-message">senha incorreta</small>}
      <button className="enter" onClick={submit}>Entrar</button>
    </StyledUnlockPage>
  );
}

export const StyledUnlockPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: .2rem;
  
  & .title {
    margin-bottom: 2rem;
  }

  & .error-message {
    color: red;
  }

  & .enter {
    background-color: #036b0a;
    color: #fff;
    border-radius: .2rem;
    border: none;
    cursor: pointer;
    transition: all 300ms;

    &:hover {
      background-color: #13921b;
    }
    
    &:active {
      background-color: #035309;
    }
  }

  & label {
    display: flex;
    gap: .4rem;
  }
`;