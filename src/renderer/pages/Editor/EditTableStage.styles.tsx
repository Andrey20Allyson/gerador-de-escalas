import styled from "styled-components";

export const StyledSelector = styled.section`
  align-items: center;
  display: flex;
  position: relative;
  padding: 0.2rem;
  background-color: #f3f3f3;
  border: 1px solid #0003;
  user-select: none;

  & > .selection-section {
    position: absolute;
    left: -1px;
    bottom: 0;
    transform: translate(0, 100%);
    background-color: #f3f3f3;
    border: 1px solid #0003;
    visibility: hidden;
    width: max-content;
    max-width: 170%;
    flex-wrap: wrap;
    padding: 0.2rem;
    box-sizing: border-box;
    display: flex;
    gap: 0.2rem;
    justify-content: stretch;

    & > button {
      cursor: pointer;
      border: none;
      transition: background-color 200ms;
      flex: 1;

      &:hover {
        background-color: #0002;
      }
    }
  }

  &:hover {
    background-color: #eaeaea;

    & > .selection-section {
      visibility: visible;
    }
  }
`;

export const StyledToolsSection = styled.section`
  background-color: #f3f3f3;
  height: 3rem;
  display: flex;
  align-items: stretch;
  padding: 0.5rem 1.5rem;
  box-sizing: border-box;
  gap: 0.4rem;
  box-shadow: 0 0.3rem 0.4rem #0003;
  z-index: 9;

  & > button {
    background-color: #efefef;
    background-image: none;
    color: #000;
    border-radius: 0;
    box-shadow: none;
    font-weight: normal;
    border: 1px solid #0002;
    cursor: pointer;
    font-size: 1rem;
    transition: all 200ms;
    display: flex;
    align-items: center;
    gap: 0.2rem;

    &:hover {
      box-shadow: 0 0.3rem 0.3rem #0003;
    }

    &:active {
      box-shadow: none;
    }
  }
`;

export const StyledEditTableStageBody = styled.section`
  flex-direction: column;
  display: flex;
  flex: 1;
  width: 100%;
  z-index: 2;

  & > .editor-section {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: start;
  }
`;
