import styled from "styled-components";

export const StyledWorkerRegistryView = styled.div`
  background-color: #fafafa;
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
  width: 20rem;
  display: flex;
  box-shadow: -0.2rem 0.2rem 0.3rem #0002;

  & > .left-col {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    flex: 4;

    & > h2 {
      text-align: left;
      font-size: 1rem;
    }

    & > p {
      margin: 0;
      display: flex;
      flex: 1;
      justify-content: space-between;
    }
  }

  & > .right-col {
    flex: 0.5;
    align-items: center;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    & > svg {
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 300ms;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
`;
