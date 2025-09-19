import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemberForm } from "@/components/members/member-form";
import type { MembershipPlan } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("MemberForm", () => {
  const plans: MembershipPlan[] = [
    { id: "plan-1", name: "Unlimited", price: 99, duration_days: 30, is_active: true, description: "" },
  ];

  it("validates required fields", async () => {
    render(<MemberForm plans={plans} />);

    const submit = screen.getByRole("button", { name: /create member/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
    });
  });
});
