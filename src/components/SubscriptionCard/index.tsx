import { useMemo, useState } from "react";
import styled from "styled-components";
import { formatCurrency } from "../../lib/currency";
import { imageOptimizedUrl } from "../../lib/imageOptimizedUrl";
import { Button } from "../Button";

// const Card = styled.section`
//   background: #ffffff;
//   border: 1px solid #ececec;
//   border-radius: 10px;
//   box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
//   padding: 24px;

//   display: grid;
//   grid-template-columns: 96px minmax(0, 1fr);
//   column-gap: 18px;
//   row-gap: 10px;
//   align-items: start;

//   /* Give it that “centered card on page” feel if parent doesn’t constrain */
//   max-width: 880px;
//   width: 100%;
// `;

const Card = styled.section`
  background: #ffffff;
  border: 1px solid #ececec;
  border-radius: 12px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
  padding: 28px 24px;

  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 14px;

  max-width: 420px;
  width: 100%;
`;
const ProductImage = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 16px;
  overflow: hidden;
  background: transparent;

  display: grid;
  place-items: center;

  img {
    width: 96px;
    height: 96px;
    object-fit: contain;
    border-radius: 16px;
    display: block;
  }
`;

const ProductInfo = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;

const ProductName = styled.h3`
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0;
  color: #111;

  /* prevent super-long titles from breaking layout */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  display: grid;
  gap: 6px;
  color: #5f5f5f;
  font-size: 14px;
`;

const StatusPill = styled.span<{ $state: string }>`
  /* Starting point shows “Active • until …” as plain text, not a pill */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #111;
  font-weight: 600;

  &::before {
    content: "";
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 1.5px solid #bdbdbd;
    background: ${({ $state }) => ($state === "ACTIVE" ? "#111" : "transparent")};
  }

  button {
    border-radius: 999px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #e6e6e6;
    color: #111;
  }
`;

const ExtendPanel = styled.div`
  /* Move button under the meta like the screenshot */
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;

  /* Remove the “panel” look */
  background: transparent;
  border-radius: 0;
  padding: 0;

  label {
    display: none; /* starting point doesn’t show a label */
  }
`;

const Select = styled.select`
  /* Starting point has NO dropdown — hide it for now */
  display: none;
`;


export type RentalPlan = {
  id: string;
  period: number;
  price: number;
  productId: string;
};

export type Subscription = {
  id: string;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  activeUntil: string;
  terminatedAt: string | null;
  terminationReason: string | null;
  terminationComment: string | null;
  rentalPeriod: number;
  monthlyPrice: number;
  state: "ACTIVE" | "DRAFT" | "FULFILLING" | "TERMINATED";
  productId: string;
  product: {
    id: string;
    slug: string;
    title: string;
    coreAttribute: string;
    image: string;
    rentalPlans: RentalPlan[];
  };
};

type SubscriptionCardProps = {
  subscription: Subscription;
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [selectedMonths, setSelectedMonths] = useState(subscription.rentalPeriod);

  const currentPlan = useMemo(() => {
    return subscription.product.rentalPlans.find(
      (plan) => plan.period === subscription.rentalPeriod
    );
  }, [subscription.product.rentalPlans, subscription.rentalPeriod]);

  const handleExtend = () => {
    // TODO: Wire up API call + optimistic UI update for subscription extension.
    alert("TODO: implement subscription extension");
  };

  return (
    <Card >
      <ProductImage>
        <img
          src={imageOptimizedUrl(subscription.product.image)}
          alt={subscription.product.title}
          width={140}
          height={105}
          style={{ objectFit: "cover", borderRadius: 12 }}
        />
      </ProductImage>
      <ProductInfo>
        <ProductName>{subscription.product.title}</ProductName>
        <Meta>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPill $state={subscription.state}>
              {subscription.state === "ACTIVE" ? "Active" : subscription.state}
            </StatusPill>
            <span style={{ color: "#9a9a9a" }}>•</span>
            <span>until {new Date(subscription.activeUntil).toLocaleDateString()}</span>
          </div>

          <div style={{ color: "#111", fontWeight: 500 }}>
            {currentPlan || subscription.monthlyPrice
              ? `${formatCurrency(currentPlan?.price ?? subscription.monthlyPrice)} per month`
              : ""}
          </div>
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
            .sort((a, b) => a.period - b.period)
            .map((plan) => (
              <option key={plan.id} value={plan.period}>
                {plan.period} months - {formatCurrency(plan.price)}
              </option>
            ))}
        </Select>
        <Button onClick={handleExtend}>Extend rental</Button>
      </ExtendPanel>
    </Card>
  );
}
