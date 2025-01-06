import styled from "styled-components";

export const StyledRegistryGridBody = styled.section`
  flex: 1;
  display: flex;
  align-items: stretch;

  & > .scrollable-container {
    flex: 1;
  }
`;

export const StyledRegistryGrid = styled.span`
  border-top: 1px solid #0003;
  box-sizing: content-box;
  padding: 1rem;
  flex: 1;
  display: grid;
  box-sizing: content-box;
  grid-template-columns: repeat(auto-fill, minmax(min-content, 22rem));
  justify-content: center;
  justify-items: center;
  gap: 0.8rem;
`;
