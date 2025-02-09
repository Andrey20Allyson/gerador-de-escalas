import styled from "styled-components";

export const InfoCardDiv = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateY(calc(-100%)) translateX(-50%);
  padding-bottom: 0.25rem;
  animation-duration: 500ms;
  animation-name: info-card-in;
  pointer-events: none;

  @keyframes info-card-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes info-card-out {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  &.hiding {
    animation-name: info-card-out;
    opacity: 0;
  }

  /* transform: translateY(calc(-100% - 0.5rem)) translateX(-50%); */
  /* background-color: #e0e0e0;
  border-radius: 0.5rem;
  border: 1px solid #0005;
  padding: 0.25rem;
  box-shadow: -0.15rem 0.15rem 0.2rem #0003; */
`;
