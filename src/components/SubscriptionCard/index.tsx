import { useMemo, useState } from "react";
import styled from "styled-components";
import { formatCurrency } from "../../lib/currency";
import { imageOptimizedUrl } from "../../lib/imageOptimizedUrl";
import { Button } from "../Button";
import SimpleModal from "../SimpleModal";

const Card = styled.section<{ $disabled?: boolean }>`
  background: #ffffff;
  border: 1px solid #ececec;
  border-radius: 8px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
  padding:24px;

  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  column-gap: 18px;
  row-gap: 10px;
  align-items: start;

  max-width: 880px;
  width: 100%;

  transition: opacity 120ms ease, filter 120ms ease;

  ${({ $disabled }) =>
    $disabled &&
    `
    opacity: 0.55;
    filter: grayscale(1);
    pointer-events: none;
  `}
  
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
  display: flex;
  flex-direction: column;
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
  display: grid;
  align-items: start;
  gap: 12px;
  margin-top: 6px;

  /* Remove the “panel” look */
  background: transparent;
  border-radius: 0;
  padding: 0;


`;

const Select = styled.select`
  /* Starting point has NO dropdown — hide it for now */
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
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
  onExtended?: () => Promise<void> | undefined;
};

type ProductDetailsProps = {
  subscription: Subscription;
  isEnded: boolean;
  isDisabled: boolean;
  onExtended?: () => Promise<void> | undefined;
};

type handleExtendProps = {
  subscription: Subscription,
  selectedPlan: RentalPlan | undefined,
  setIsOpen: (isOpen: boolean) => void,
  isSubmitting: boolean,
  setIsSubmitting: (isSubmitting: boolean) => void
  onExtended?: () => Promise<void> | undefined
};

function useExtendSubscription(subscrption: Subscription, onExtended?: () => Promise<void> | undefined) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extendSubscription = async (selectedPlan: RentalPlan | undefined) => {
    if (!selectedPlan || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/subscriptions/${subscrption.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newRentalPeriod: selectedPlan.period }),
      });

      if (!response.ok) {
        throw new Error("Failed to extend subscription");
      }

      setIsOpen(false);
      await onExtended?.();
      alert("Subscription extended successfully!");
    } catch (error) {
      console.error("Error extending subscription:", error);
      alert("Error extending subscription: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    isSubmitting,
    extendSubscription
  }
}

function ProductDetails({ subscription, isEnded, isDisabled, onExtended }: ProductDetailsProps) {
  const [selectedMonths, setSelectedMonths] = useState(subscription.rentalPeriod);


  const currentPlan = useMemo(() => {
    return subscription.product.rentalPlans.find(
      (plan) => plan.period === subscription.rentalPeriod
    );
  }, [subscription.product.rentalPlans, subscription.rentalPeriod]);

  const selectedPlan = useMemo(() => {
    return subscription.product.rentalPlans.find(
      (plan) => plan.period === selectedMonths
    );
  }, [subscription.product.rentalPlans, selectedMonths]);

  const {
    isOpen,
    openModal,
    closeModal,
    isSubmitting,
    extendSubscription
  } = useExtendSubscription(subscription, onExtended);

  if (isDisabled) {
    return <small style={{ color: "#777" }}>
      {isEnded
        ? "Subscription has ended"
        : "Maximum rental period reached"}
    </small>
  }

  return (
    <>
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
      <ExtendPanel>
        <label htmlFor={`extend-${subscription.id}`}>Extend rental</label>
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
        {selectedPlan && selectedPlan?.period <= subscription.rentalPeriod ? (
          <small style={{ color: "#777" }}>
            Please select a longer rental period to extend your subscription.
          </small>
        ) : (
          <Button onClick={() => openModal()}>Extend rental to {selectedPlan?.period} months for {selectedPlan?.price ? formatCurrency(selectedPlan.price) : "N/A"}</Button>
        )
        }
      </ExtendPanel>
      {isOpen && (
        <SimpleModal isOpen={isOpen} onClose={() => closeModal()}>
          <h3>Extend subscription</h3>
          <p>Are you sure you want to extend?</p>
          <p>
            <b>{subscription.product.title}</b> to {selectedPlan?.period} months for {selectedPlan?.price ? formatCurrency(selectedPlan.price) : "N/A"}.
          </p>
          <p></p>
          <Button onClick={() => closeModal()}>Cancel</Button>
          <Button disabled={isSubmitting} onClick={
            () => extendSubscription(selectedPlan)
          }
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        </SimpleModal>
      )}
    </>
  );
}

export function SubscriptionCard({ subscription, onExtended }: SubscriptionCardProps) {

  const isEnded = subscription.state === "TERMINATED" || new Date(subscription.activeUntil) < new Date();

  const hasExtensionOptions = subscription.product.rentalPlans.some(
    (plan) => plan.period > subscription.rentalPeriod
  );

  const isDisabled = isEnded || !hasExtensionOptions;

  return (
    <Card $disabled={isDisabled}>
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
        <ProductDetails subscription={subscription} isDisabled={isDisabled} isEnded={isEnded} onExtended={onExtended} />
      </ProductInfo>
    </Card >
  );
}

