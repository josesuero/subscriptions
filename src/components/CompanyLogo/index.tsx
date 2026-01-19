import styled from "styled-components";

const Logo = styled.div`
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Accent = styled.span`
  color: #ff6f3c;
`;

export function CompanyLogo() {
  return (
    <Logo>
      Grover<Accent>+</Accent>
    </Logo>
  );
}
