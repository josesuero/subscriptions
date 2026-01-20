import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { SubscriptionCard, type Subscription } from "../components/SubscriptionCard";
import { SubscriptionWrapper } from "../components/SubscriptionWrapper";
import { CompanyLogo } from "../components/CompanyLogo";
import { fetchJson } from "../lib/fetch";
import { SubscrpitionPages } from "../models/models";
import { Button } from "../components/Button";

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
  gap: 12px;
`;

const Status = styled.p`
  margin: 0;
  color: #4a4a4a;
`;

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
`;

const PageInfo = styled.span`
  color: #4a4a4a;
  font-size: 14px;
`;


export default function HomePage() {
  const [data, setData] = useState<SubscrpitionPages>({ items: [], page: 1, limit: 2, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let mounted = false;

  const loadSubscriptions = async (nextPage = page) => {
    setLoading(true);
    setError(null);

    try {
      var res = await fetchJson<SubscrpitionPages>(
        `/api/subscriptions?page=${nextPage}&limit=${data.limit}`
      );
      // if (!mounted) return;
      setData(res);

    } catch (err) {
      if (!mounted) return;
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    }

    if (!mounted) return;
    setLoading(false);
  }


  useEffect(() => {
    console.log("reloading subscriptions..." + page);
    mounted = true;
    const run = async () => {
      await loadSubscriptions(page);
    };
    void run();


    return () => {
      mounted = false;
    };
  }, [page]);

  console.log(data)

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
        {data.items.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} onExtended={() => loadSubscriptions(page)} />
        ))}
      </Grid>

      {data.totalPages > 1 && (
        <PaginationBar>
          <Button
            variant="ghost"
            disabled={loading || page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >Previous</Button>

          <PageInfo>
            Page {page} of {data.totalPages}
          </PageInfo>

          <Button
            variant="ghost"
            disabled={loading || page >= data.totalPages}
            onClick={() => setPage(Math.min(data.totalPages, page + 1))}
          >Next</Button>
        </PaginationBar>
      )}
    </SubscriptionWrapper>
  );
}
