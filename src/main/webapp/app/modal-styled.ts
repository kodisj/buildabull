import { Modal } from 'reactstrap';
import styled from 'styled-components';

export const ModalWrapper = styled(Modal)`
  & .zonebg--modal {
    background-position: top;
    margin: 0 auto;
    max-width: 345px !important;
    font-family: 'Poppins';
    border: none !important;
    border-radius: 30px !important;
    color: white;
    background: #333740;
    overflow: hidden;
  }

  & .modal-header {
    padding: 18px 20px 15px 20px;
    z-index: 3;
    border-radius: 0px;
    border: none !important;

    & .modal-title {
      font-weight: 600;
      font-size: 18px;
      line-height: 130%;
      /* color: rgba(0, 0, 0, 0.7); */
    }
    & .btn-close {
      width: 14px;
      height: 14px;
      padding: 0px;
      border: none;
      opacity: 1;
      margin: 0px;
    }
  }
  & .modal-body {
    display: flex;
    flex-direction: column;
    padding: 33px 36px 33px 36px;
    background: linear-gradient(180deg, #181a1f 0%, #333740 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 3;
    border-radius: 30px;
    color: inherit;
  }
`;
export const OptionContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 9px 20px;
  margin-top: 10px;
  gap: 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  &.peraAlgo {
    cursor: pointer;: ;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
`;

export const WalletName = styled.div`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  /* identical to box height */
  color: #ffffff;
  &.disabledText {
    color: rgba(255, 255, 255, 0.4);
  }
  & span {
    font-style: italic;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;

    color: rgba(255, 255, 255, 0.4);
  }
`;

export const WalletDescription = styled.div`
  font-size: 10px;
  line-height: 15px;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.4);
`;

export const ComingSoonText = styled.div`
  background: #fec416;
  border-radius: 20px;
  padding: 2px 6px 2px 6px;
  font-weight: 600;
  font-size: 8px;
  line-height: 12px;
  max-width: 67px;
  color: #ffffff;

  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.12);
`;

export const WalletImage = styled.div`
  width: 30px;
  height: 30px;
`;

// export const ModalWrapper = styled(Modal)`
//   font-family: 'Poppins', sans-serif;
//   & .modal-dialog {
//     max-width: 530px;
//     margin: 1.75rem auto;
//     padding: 0px 10px;
//   }
//   & .modal-content {
//     border-radius: 20px;
//     position: relative;
//     z-index: 3;
//     background: linear-gradient(180deg, #fcc601 0%, #fc8401 100%);
//     background: radial-gradient(
//       100% 119.05% at 0% 0%,
//       rgba(0, 0, 0, 0.2) 0%,
//       rgba(0, 0, 0, 0.58) 100%
//     );
//     border: 3px solid rgba(255, 255, 255, 0.7);
//     border-radius: 24px;
//     overflow: hidden;
//   }
//   & .modal-header {
//     z-index: 3;
//     padding: 18px 18px 18px 21px;
//     background: rgba(0, 0, 0, 0.2);
//     backdrop-filter: blur(47px);
//     border-radius: 24px 24px 20px 20px;
//     border: none;
//     & .modal-title {
//       font-weight: 800;
//       font-size: 20px;
//       line-height: 26px;
//       font-style: italic;
//       text-transform: uppercase;
//       color: #fff;
//       text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.25);
//     }
//     & .btn-close {
//       width: 36px;
//       height: 36px;
//       padding: 0px;
//       background-color: #fff;
//       border-radius: 10px;
//       border: none;
//       color: #1f2333;
//       opacity: 1;
//     }
//   }
//   & .modal-body {
//     z-index: 3;
//     padding: 28px 45px 32px 45px;
//     @media screen and (max-width: 767px) {
//       padding: 28px 20px;
//     }
//   }
// `;
export const ModalBgColor = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  opacity: 1;
  background: linear-gradient(180deg, #fcc601 0%, #fc8401 100%);
`;
export const ModalBackgroundDark = styled.div`
  background: radial-gradient(100% 119.05% at 0% 0%, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.58) 100%);
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`;
export const ModalBgImg = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: 1;
  mix-blend-mode: soft-light;
`;
