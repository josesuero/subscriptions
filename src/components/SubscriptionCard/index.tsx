import { useMemo, useState } from "react";
import styled from "styled-components";
import { formatCurrency } from "../../lib/currency";
import { imageOptimizedUrl } from "../../lib/imageOptimizedUrl";
import { Button } from "../Button";

const Card = styled.section`
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(17, 17, 17, 0.12);
  display: grid;
  gap: 16px;
  padding: 24px;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: 900px) {
    grid-template-columns: 160px minmax(0, 1fr) 240px;
    align-items: center;
  }
`;

const ProductImage = styled.div`
  width: 100%;
  max-width: 160px;
  aspect-ratio: 4 / 3;
  background: #f4f0ea;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #9a8c77;
  font-weight: 600;
`;

const ProductInfo = styled.div`
  display: grid;
  gap: 8px;
`;

const ProductName = styled.h3`
  font-size: 1.4rem;
  margin: 0;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #4a4a4a;
  font-size: 0.95rem;
`;

const StatusPill = styled.span<{ $state: string }>`
  background: ${({ $state }) => ($state === "ACTIVE" ? "#101820" : "#f2c94c")};
  color: #fff;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
`;

const ExtendPanel = styled.div`
  display: grid;
  gap: 8px;
  background: #fdf7ed;
  border-radius: 18px;
  padding: 16px;
`;

const Select = styled.select`
  border: 1px solid #d1c3ad;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.95rem;
  background: #fff;
`;

export type RentalPlan = {
  id: number;
  months: number;
  priceCents: number;
};

export type Subscription = {
  id: number;
  state: "ACTIVE" | "PAUSED" | "CANCELLED";
  rentalPeriodMonths: number;
  activeUntil: string;
  product: {
    name: string;
    imageUrl: string;
    rentalPlans: RentalPlan[];
  };
};

type SubscriptionCardProps = {
  subscription: Subscription;
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [selectedMonths, setSelectedMonths] = useState(subscription.rentalPeriodMonths);

  const currentPlan = useMemo(() => {
    return subscription.product.rentalPlans.find(
      (plan) => plan.months === subscription.rentalPeriodMonths
    );
  }, [subscription.product.rentalPlans, subscription.rentalPeriodMonths]);

  const handleExtend = () => {
    // TODO: Wire up API call + optimistic UI update for subscription extension.
    alert("TODO: implement subscription extension");
  };

  return (
    <Card>
      <ProductImage>
        <img
          src={imageOptimizedUrl(subscription.product.imageUrl)}
          alt={subscription.product.name}
          width={140}
          height={105}
          style={{ objectFit: "cover", borderRadius: 12 }}
        />
      </ProductImage>
      <ProductInfo>
        <ProductName>{subscription.product.name}</ProductName>
        <Meta>
          <span>
            Plan: {subscription.rentalPeriodMonths} months
            {currentPlan ? ` (${formatCurrency(currentPlan.priceCents)})` : ""}
          </span>
          <span>Active until: {new Date(subscription.activeUntil).toLocaleDateString()}</span>
          <StatusPill $state={subscription.state}>{subscription.state}</StatusPill>
        </Meta>
      </ProductInfo>
      <ExtendPanel>
        <label htmlFor={`extend-${subscription.id}`}>Extend subscription</label>
        <Select
          id={`extend-${subscription.id}`}
          value={selectedMonths}
          onChange={(event) => setSelectedMonths(Number(event.target.value))}
        >
          {subscription.product.rentalPlans
            .slice()
            .sort((a, b) => a.months - b.months)
            .map((plan) => (
              <option key={plan.id} value={plan.months}>
                {plan.months} months - {formatCurrency(plan.priceCents)}
              </option>
            ))}
        </Select>
        <Button onClick={handleExtend}>Extend</Button>
      </ExtendPanel>
    </Card>
  );
}
