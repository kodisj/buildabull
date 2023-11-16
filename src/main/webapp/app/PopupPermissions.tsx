import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, ButtonGroup } from 'reactstrap';

export type PopupProps = {
  isOpen: boolean;
  result(s: string): void;
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

// ReactModal.setAppElement('#root');
export function PopupPermissions(props: PopupProps) {
  return (
    <div>
      <Modal isOpen={props.isOpen} contentLabel="Popup Permissions">
        <Button
          onClick={() => {
            props.result('decline');
          }}
        >
          Nevermind
        </Button>
        <Button
          onClick={() => {
            props.result('approve');
          }}
        >
          Proceed
        </Button>
      </Modal>
    </div>
  );
}
