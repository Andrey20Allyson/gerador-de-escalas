import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { Dots } from 'react-activity';
import styled from "styled-components";

export interface UnlockPageProps {
  isLoading?: boolean;
  hasPasswordError?: boolean;
  onSubmit?: (password: string) => void;
}

export default function UnlockPage(props: UnlockPageProps) {
  const {
    onSubmit,
    isLoading = false,
    hasPasswordError = false,
  } = props;

  const [password, setPassword] = useState('');
  const [hasPasswordEmpityError, setPasswordEmpityError] = useState(false);

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    setPassword(ev.currentTarget.value);
  }

  function submit() {
    if (password.length === 0) {
      setPasswordEmpityError(true);
      return;
    }

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
      {hasPasswordEmpityError && <small className="error-message">senha não pode ser vazia!</small>}
      {hasPasswordError && <small className="error-message">senha incorreta!</small>}
      <button className="enter" onClick={submit}>Entrar</button>
      {isLoading && <Dots color="#0caa17"/>}
    </StyledUnlockPage>
  );
}

export const StyledUnlockPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: .2rem;
  align-items: center;
  
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
    padding: .3rem .4rem;

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