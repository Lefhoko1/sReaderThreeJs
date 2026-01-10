# Payments & Subscriptions

## App Usage
- Free trial with limits (time, features, or tickets).
- Paid tiers unlock features and increase quotas (e.g., multiplayer, asset usage, class count).

## Tickets
- Tickets are consumable credits for premium features. Balance tracked per user.

## Providers
- Phase 1: Orange Money (Botswana + supported regions).
- Phase 2+: Add card, mobile money variants.

## Flows
- Purchase → Provider → Webhook → Credit tickets/subscription → Notify user.
- Refund/chargeback handling; ledger in `PaymentTransaction`.

## Compliance
- Receipts, audit logs, and regional requirements for mobile money.
