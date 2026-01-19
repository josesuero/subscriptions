import { useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { SubscriptionCard, type Subscription } from "../components/SubscriptionCard";
import { SubscriptionWrapper } from "../components/SubscriptionWrapper";
import { CompanyLogo } from "../components/CompanyLogo";
import { fetchJson } from "../lib/fetch";

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
`;

const Headline = styled.div`
  display: grid;
  gap: 8px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
`;

const Subtitle = styled.p`
  margin: 0;
  color: #4a4a4a;
  max-width: 640px;
`;

const Grid = styled.div`
  display: grid;
  gap: 24px;
`;

const Status = styled.p`
  margin: 0;
  color: #4a4a4a;
`;

export default function HomePage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchJson<Subscription[]>("/api/subscriptions")
      .then((data) => {
        if (!mounted) return;
        setSubscriptions(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load subscriptions");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SubscriptionWrapper>
      <Head>
        <title>Subscriptions</title>
      </Head>

      <Header>
        <Headline>
          <CompanyLogo />
          <Title>Subscription Extensions</Title>
          <Subtitle>
            Review active subscriptions and extend rental periods. Core business rules are
            intentionally missing for the interview exercise.
          </Subtitle>
        </Headline>
      </Header>

      {loading && <Status>Loading subscriptions...</Status>}
      {error && <Status>{error}</Status>}

      <Grid>
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </Grid>
    </SubscriptionWrapper>
  );
}
