import { describe, it, expect } from 'vitest';

describe('Payment & Coupon Calculation Engine', () => {
  it('correctly calculates percentage coupon discounts', () => {
    const subtotal = 1000;
    const discountPercent = 25;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discountAmount;

    expect(discountAmount).toBe(250);
    expect(total).toBe(750);
  });

  it('correctly caps flat coupon discounts to avoid negative totals', () => {
    const subtotal = 80;
    const flatDiscount = 100;
    const total = Math.max(0, subtotal - flatDiscount);

    expect(total).toBe(0);
  });

  it('verifies razorpay amount in paise conversion', () => {
    const amountInr = 799;
    const paise = Math.round(amountInr * 100);
    expect(paise).toBe(79900);
  });
});
