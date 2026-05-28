import { logger } from "@/backend/utils/logger";
import { ApiException } from "@/backend/utils/api-response";

/* ------------------------------------------------------------------ */
/*  Interfaces                                                         */
/* ------------------------------------------------------------------ */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  providerData?: Record<string, unknown>;
}

export interface PaymentProvider {
  /** Human‑readable provider name (e.g. "cod", "razorpay") */
  name: string;

  /** Create a payment order / intent on the provider side. */
  createOrder(amount: number, orderId: string): Promise<PaymentIntent>;

  /**
   * Verify a payment using provider‑specific data
   * (webhook body, callback params, etc.).
   */
  verifyPayment(paymentData: unknown): Promise<boolean>;
}

/* ------------------------------------------------------------------ */
/*  MockPaymentProvider  (COD / development)                           */
/* ------------------------------------------------------------------ */

export class MockPaymentProvider implements PaymentProvider {
  public readonly name = "cod";

  async createOrder(amount: number, orderId: string): Promise<PaymentIntent> {
    logger.info("MockPaymentProvider.createOrder", { amount, orderId });

    return {
      id: `mock_pay_${orderId}_${Date.now()}`,
      amount,
      currency: "INR",
      status: "created",
      providerData: {
        provider: "mock",
        orderId,
        note: "Cash on Delivery — no actual charge",
      },
    };
  }

  async verifyPayment(_paymentData: unknown): Promise<boolean> {
    logger.info("MockPaymentProvider.verifyPayment – auto‑approved");
    return true;
  }
}

/* ------------------------------------------------------------------ */
/*  Provider Registry                                                  */
/* ------------------------------------------------------------------ */

const providers: Record<string, () => PaymentProvider> = {
  cod: () => new MockPaymentProvider(),
  // Future: razorpay: () => new RazorpayProvider(),
};

/**
 * Returns the payment provider for the given method.
 * Throws ApiException (400) for unsupported methods.
 */
export function getPaymentProvider(method: string): PaymentProvider {
  const factory = providers[method.toLowerCase()];

  if (!factory) {
    throw new ApiException(
      `Unsupported payment method: "${method}". Supported: ${Object.keys(providers).join(", ")}`,
      400
    );
  }

  return factory();
}

/* ------------------------------------------------------------------ */
/*  Convenience helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * One‑liner: get provider → create order → return intent.
 */
export async function processPayment(
  method: string,
  amount: number,
  orderId: string
): Promise<PaymentIntent> {
  const provider = getPaymentProvider(method);
  const intent = await provider.createOrder(amount, orderId);

  logger.info("processPayment – intent created", {
    provider: provider.name,
    intentId: intent.id,
    amount,
  });

  return intent;
}

/**
 * Verify a payment webhook / callback payload.
 */
export async function verifyPaymentWebhook(
  method: string,
  paymentData: unknown
): Promise<boolean> {
  const provider = getPaymentProvider(method);
  const verified = await provider.verifyPayment(paymentData);

  logger.info("verifyPaymentWebhook", {
    provider: provider.name,
    verified,
  });

  return verified;
}
