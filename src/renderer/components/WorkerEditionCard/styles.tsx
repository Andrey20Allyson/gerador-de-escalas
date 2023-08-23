import styled from "styled-components";
import { BackgroundColor } from "../../styles";

export const StyledWorkerEditionCard = styled.span`
  ${BackgroundColor.bg0}
  font-size: .9rem;
  border: 1px solid #0004;
  max-width: 70rem;
  width: 100%;
  border-radius: .5rem;
  margin: 0 .4rem;
  padding: .5rem;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: .2rem;

  &>.presentation {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    gap: .2rem;
    width: 35%;

    &>.name {
      margin: 0;
      flex: .8;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      font-weight: bold;
      text-overflow: ellipsis;
    }

    &>.info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: .5rem;

      &>.graduation {
        background-color: #00000036;
        padding: .2rem;
        border-radius: .2rem;
        border: 1px solid #ffffffb7;
        text-align: center;
        width: 36%;
      }

      &>.id-box {
        display: flex;
        gap: .2rem;
        align-items: end;
        margin: 0;
        
        &>.title {
          font-size: .7rem;
        }

        &>.content {
          cursor: pointer;
          font-weight: bold;
          user-select: none;
          position: relative;
          transition: all 4000ms;

          &.copied {
            transition-duration: 100ms;
            --stroke-color: #0004
            text-shadow: 
               1px  1px 0 var(--stroke-color),
              -1px -1px 0 var(--stroke-color),
               1px -1px 0 var(--stroke-color),
              -1px  1px 0 var(--stroke-color);
              
            color: #0af502;
          }

          &::after {
            content: " ";
            position: absolute;
            height: 2px;
            width: 0;
            background-image: linear-gradient(90deg, #00ff554c, #11ee09, #00ff554c);
            transition: all 200ms;
            transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
            bottom: 0;
            left: 50%;
          }

          &:hover::after {
            width: 100%;
            left: 0;
          }
        }
      }
    }
  }

  &>.duty-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: .3rem;
    width: 60%;
  }

  &>.commands {
    display: flex;
    flex-direction: column;
    gap: .2rem;

    &>* {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #ffffffbe;
      border-radius: .3rem;
      border: 1px solid #aaaaaa8f;
      width: min-content;
      padding: .3rem;
      height: 100%;
      cursor: pointer;
      transition: all 200ms;
      font-size: 1rem;

      &:hover {
        color: #fff;
      }
  
      &.add-duty-button {
        background-color: #99999961;
        border-color: #fff;
  
        &:hover {
          background-color: #dbdbdb;
        }
      }
      
      &.delete-all-button {
        background-color: #f004;
        border-color: #f008;
  
        &:hover {
          background-color: #d32e2e;
        }
      }
    }
  }
`;
