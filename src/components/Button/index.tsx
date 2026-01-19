import type { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

const StyledButton = styled.button<{ $variant: "primary" | "ghost" }>`
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  }

  ${({ $variant }) =>
    $variant === "primary"
      ? `
        background: #111;
        color: #fdfbf7;
      `
      : `
        background: transparent;
        color: #111;
        border-color: #111;
      `}
`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return <StyledButton $variant={variant} {...props} />;
}
