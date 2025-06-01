# 005 Implement Payment Confirmation Flow

## Dependencies
- 004: Implement Ticket Purchase with Concurrency Control

## Description
Implement the payment confirmation flow for ticket purchases. This includes a mock payment process (since this is a demo app) and updating the ticket allocation status from reserved to purchased once payment is confirmed.

## Technical Requirements
- Implement payment confirmation API endpoint
- Update ticket allocation status when payment is confirmed
- Handle payment cancellation
- Track payment confirmation timestamps
- Return appropriate responses for success/failure

## Specific test cases required
- Payment confirmation changes ticket status from reserved to purchased
- Payment cancellation releases the reserved ticket back to the pool
- Cannot confirm payment for a non-existent ticket allocation
- Cannot confirm payment for an already purchased ticket

## Acceptance Criteria
- [x] POST /tickets/:id/payment endpoint confirms payment for a reserved ticket
- [x] DELETE /tickets/:id/payment endpoint cancels a payment and releases the ticket
- [x] Ticket status is correctly updated in the database
- [x] Released tickets return to the available pool
- [x] Proper error handling for invalid payment confirmations
- [x] Consistent identification of the user attempting to pay
- [x] Tests passing

## Implementation Notes
- This is a mock payment flow (no real payment processing)
- Update ticket allocation status from "reserved" to "purchased" on confirmation
- When cancelling, update status from "reserved" to "cancelled" and adjust available count
- Use the same user fingerprinting mechanism from the ticket purchase flow
- Consider implementing a timeout mechanism for reserved tickets
- Use transactions to ensure data consistency during status changes
- Include error handling for edge cases (e.g., expired reservations)

## Documentation Requirements:
- [x] Update API documentation with payment endpoints
- [x] Document payment flow and possible status transitions 