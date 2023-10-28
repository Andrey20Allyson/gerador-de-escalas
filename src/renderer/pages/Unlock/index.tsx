import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import styled from "styled-components";

export interface UnlockPageProps {
  onSubmit?: (password: string) => void;
}

export default function UnlockPage(props: UnlockPageProps) {
  const {
    onSubmit,
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
        <input type="text" onChange={handleChange} onKeyDown={handleKeyDown} />
      </label>
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