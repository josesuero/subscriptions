import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import HomePage from "../../src/pages/index";
import type { Subscription } from "../../src/components/SubscriptionCard";

const subscriptions: Subscription[] = [
  {
    id: "sub_1",
    referenceId: "ref_1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    activeUntil: "2099-01-01T00:00:00.000Z",
    terminatedAt: null,
    terminationReason: null,
    terminationComment: null,
    rentalPeriod: 6,
    monthlyPrice: 129,
    state: "ACTIVE",
    productId: "prod_1",
    product: {
      id: "prod_1",
      slug: "camera-kit",
      title: "Camera Kit",
      coreAttribute: "4K",
      image: "/images/camera.png",
      rentalPlans: [
        { id: "plan_6", period: 6, price: 129, productId: "prod_1" },
        { id: "plan_12", period: 12, price: 109, productId: "prod_1" }
      ]
    }
  },
  {
    id: "sub_2",
    referenceId: "ref_2",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-02-01T00:00:00.000Z",
    activatedAt: "2024-02-01T00:00:00.000Z",
    activeUntil: "2099-02-01T00:00:00.000Z",
    terminatedAt: null,
    terminationReason: null,
    terminationComment: null,
    rentalPeriod: 3,
    monthlyPrice: 79,
    state: "ACTIVE",
    productId: "prod_2",
    product: {
      id: "prod_2",
      slug: "drone-starter",
      title: "Drone Starter Pack",
      coreAttribute: "HD",
      image: "/images/drone.png",
      rentalPlans: [
        { id: "plan_3", period: 3, price: 79, productId: "prod_2" },
        { id: "plan_6", period: 6, price: 69, productId: "prod_2" }
      ]
    }
  }
];


afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HomePage", () => {
  it("renders subscription cards when data is available", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: subscriptions,
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 2
      }),
      text: async () => ""
    });
    vi.stubGlobal("fetch", fetchMock);

    const screen = await render(React.createElement(HomePage));

    await expect.element(screen.getByText("Camera Kit")).toBeVisible();
    await expect.element(screen.getByText("Drone Starter Pack")).toBeVisible();
  });

  it("changes select and clicks extend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: subscriptions,
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2
      }),
      text: async () => ""
    });
    vi.stubGlobal("fetch", fetchMock);

    const screen = await render(React.createElement(HomePage));

    await expect.element(screen.getByText("Camera Kit")).toBeVisible();

    const select = screen.getByLabelText("Extend rental").first();
    await select.selectOptions("12");

    await screen
      .getByRole("button", { name: /extend rental to 12 months/i })
      .click();

    await expect.element(screen.getByText("Extend subscription")).toBeVisible();
  });

  it("Loads next page when clicking next", async () => {
    const page1 = {
      items: [subscriptions[0]],
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2
    }

    const page2 = {
      items: [subscriptions[1]],
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2
    }



    const fetchPageMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1,
        text: async () => ""
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2,
        text: async () => ""
      });
    vi.stubGlobal("fetch", fetchPageMock);

    const screen = await render(React.createElement(HomePage));


    await expect.element(screen.getByText("Camera Kit")).toBeVisible();
    await expect.element(screen.getByText("Drone Starter Pack")).not.toBeInTheDocument();

    await expect.element(screen.getByText(/page 1 of 2/i)).toBeVisible();

    await screen.getByRole("button", { name: /next/i }).click();


    await expect.element(screen.getByText("Camera Kit")).not.toBeInTheDocument();
    await expect.element(screen.getByText("Drone Starter Pack")).toBeVisible();

    await expect.element(screen.getByText(/page 2 of 2/i)).toBeVisible();

    expect(fetchPageMock.mock.calls[1][0]).toContain("page=2");

  });

});
