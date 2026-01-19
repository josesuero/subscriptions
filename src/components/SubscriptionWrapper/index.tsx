import type { ReactNode } from "react";
import styled from "styled-components";

const Wrapper = styled.main`
  min-height: 100vh;
  background: radial-gradient(circle at top left, #fcefdc 0%, #fdfbf7 40%, #f4f0ea 100%);
  padding: 48px 24px 64px;
  color: #111;
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

type SubscriptionWrapperProps = {
  children: ReactNode;
};

export function SubscriptionWrapper({ children }: SubscriptionWrapperProps) {
  return (
    <Wrapper>
      <Inner>{children}</Inner>
    </Wrapper>
  );
}
