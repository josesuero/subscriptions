import { useEffect } from 'react';
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
`;


export default function SimpleModal({ isOpen, onClose, children }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                {children}
            </Modal>
        </Overlay>
    );
}
