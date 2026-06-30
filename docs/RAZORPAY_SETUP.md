# Razorpay Payment Setup

KiranaMart uses Razorpay Standard Checkout. Customers enter UPI or banking credentials only inside Razorpay's hosted checkout. KiranaMart never receives or stores a UPI PIN, card number, CVV, or bank password.

## 1. Activate the merchant account

1. Create or open the owner's Razorpay merchant account.
2. Complete KYC and add the owner's settlement bank account in Razorpay.
3. Use Test Mode first. Switch to Live Mode only after Razorpay activates live payments and settlements.
4. Keep automatic payment capture enabled. The backend also attempts server-side capture when Razorpay returns an authorised payment.

## 2. Configure backend secrets

Copy the Razorpay variables from `backend/.env.example` into `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_me
RAZORPAY_WEBHOOK_SECRET=replace_with_a_separate_webhook_secret
```

Never put `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in frontend code. The public key ID is returned by the backend only when secure checkout is opened.

## 3. Configure the webhook

In Razorpay Dashboard, create a webhook pointing to:

```text
https://YOUR_API_DOMAIN/api/payments/webhook
```

Subscribe to:

- `payment.captured`
- `payment.failed`
- `order.paid`

Use a unique webhook secret and place the same value in `RAZORPAY_WEBHOOK_SECRET`. Production webhooks require a publicly accessible HTTPS backend; `localhost` cannot receive Razorpay webhooks.

## 4. Test before going live

1. Start the backend and frontend.
2. Sign in as a customer and add products to the cart.
3. Choose `UPI Payment` at checkout.
4. Complete a Razorpay Test Mode payment.
5. Confirm the order appears only after payment verification and shows `Paid`, `Razorpay`, payment ID, transaction ID, and paid time in the owner dashboard.
6. Test failed and dismissed payments. The cart should remain available and the checkout should show `Retry Payment`.

When testing is complete, replace only the backend Test Mode key ID and secret with Live Mode credentials. Settlement timing and the destination bank account are controlled by the owner's activated Razorpay merchant account.
