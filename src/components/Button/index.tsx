import type { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

const StyledButton = styled.button<{ $variant: "primary" | "ghost" }>`
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;

  border: 1px solid #e6e6e6;
  background: #ffffff;
  color: #111;

  transition: background 120ms ease, border-color 120ms ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #fafafa;
    border-color: #dcdcdc;
  }

  ${({ $variant }) =>
    $variant === "primary"
      ? `
        /* Starting point has no strong "primary" CTA yet */
        background: #ffffff;
        color: #111;
        border-color: #e6e6e6;
      `
      : `
        background: #ffffff;
        color: #111;
        border-color: #e6e6e6;
      `}
`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return <StyledButton $variant={variant} {...props} />;
}
