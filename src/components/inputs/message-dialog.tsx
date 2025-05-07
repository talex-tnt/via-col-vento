import {PropsWithChildren, useCallback, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {PrimaryAccentButton, AccentButton} from './accent-button';
import {ModalContainer, PromptText} from './dialog-base';

const MessageDialogContainer = styled.dialog`
  padding: 0;
  border-width: 0;

  background: transparent;
  &::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }

  & > div {
    transition: transform 0.2s ease-out;
    transform: translateY(-20px);
  }

  &[open] > div {
    transform: translateY(0px);
  }
`;
const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;
export const MessageDialog: React.FC<
  PropsWithChildren<{
    isOpen: boolean;
    onClose?(): void;
    onConfirm?(): void;
    onCancel?(): void;
  }>
> = (props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const closeModalWithCallback = useCallback((callback?: () => void) => {
    if (ref.current) {
      ref.current.close();
    }
    if (callback) {
      callback();
    }
    if (props.onClose) {
      props.onClose();
    }
  }, [ref.current, props.onClose]);
  useEffect(() => {
    if (ref.current) {
      if (props.isOpen) {
        ref.current.showModal();
      } else {
        ref.current.close();
      }
    }
    return () => {
      closeModalWithCallback();
    };
  }, [props.isOpen]);
  return (
    <MessageDialogContainer ref={ref}>
      <ModalContainer>
        <PromptText>{props.children}</PromptText>
        <Controls>
          <PrimaryAccentButton onClick={() => closeModalWithCallback(props.onConfirm)}>Confirm</PrimaryAccentButton>
          {props.onCancel && <AccentButton onClick={() => closeModalWithCallback(props.onCancel)}>Cancel</AccentButton>}
        </Controls>
      </ModalContainer>
    </MessageDialogContainer>
  );
};
