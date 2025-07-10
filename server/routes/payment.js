const express = require('express');
const router = express.Router();
const {
    confirmPayment,
    resendTicketEmail,
    cancelTicket,
    createOrder
} = require('../controllers/paymentController');

/**
 * @swagger
 * /ticket/send:
 *   post:
 *     summary: Confirm Razorpay payment and send ticket or cancellation email
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - showtimeId
 *               - seats
 *               - paymentId
 *               - orderId
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 66b5a6c6141cc3001fe5c245
 *               showtimeId:
 *                 type: string
 *                 example: 66b5a9f1141cc3001fe5c299
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A1", "A2"]
 *               paymentId:
 *                 type: string
 *                 example: pay_Mg9yTwLJf1W6vq
 *               orderId:
 *                 type: string
 *                 example: order_Mg9yR6PaUIfO9T
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *                 example: success
 *     responses:
 *       200:
 *         description: Payment successful, ticket sent via email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment confirmed. Ticket sent via email.
 *       400:
 *         description: Payment failed or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment failed. Cancellation email sent.
 *       404:
 *         description: User or Showtime not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User or Showtime not found
 *       500:
 *         description: Internal server error
 */
router.post('/ticket/send', confirmPayment);

/**
 * @swagger
 * /ticket/resend:
 *   post:
 *     summary: Resend a movie ticket email with PDF attachment
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - showtimeId
 *               - seats
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 66b5a6c6141cc3001fe5c245
 *               showtimeId:
 *                 type: string
 *                 example: 66b5a9f1141cc3001fe5c299
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A1", "A2"]
 *     responses:
 *       200:
 *         description: Ticket email successfully resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket re-sent successfully!
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data for resend
 *       404:
 *         description: User or showtime not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User or showtime not found for resend
 *       500:
 *         description: Server error during resend process
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to resend ticket email
 */
router.post('/ticket/resend', resendTicketEmail);

/**
 * @swagger
 * /ticket/cancel:
 *   post:
 *     summary: Cancel a booked ticket and remove seat allocation
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - showtimeId
 *               - seats
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 66b5a6c6141cc3001fe5c245
 *               showtimeId:
 *                 type: string
 *                 example: 66b5a9f1141cc3001fe5c299
 *               seats:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - row
 *                     - number
 *                   properties:
 *                     row:
 *                       type: string
 *                       example: "B"
 *                     number:
 *                       type: number
 *                       example: 5
 *     responses:
 *       200:
 *         description: Ticket cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket cancelled successfully
 *       400:
 *         description: Missing or invalid cancellation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid cancellation data
 *       404:
 *         description: Showtime or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Showtime or User not found
 *       500:
 *         description: Server error during cancellation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error during cancellation
 */
router.post('/ticket/cancel', cancelTicket);

/**
 * @swagger
 * /payment/create-order:
 *   post:
 *     summary: Create a Razorpay order for initiating payment
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - receipt
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 499
 *                 description: Amount in rupees (will be converted to paisa internally)
 *               currency:
 *                 type: string
 *                 default: INR
 *                 example: INR
 *               receipt:
 *                 type: string
 *                 example: "rcptid_123"
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: order_Mh1ByJLxCIeUhj
 *                 currency:
 *                   type: string
 *                   example: INR
 *                 amount:
 *                   type: number
 *                   example: 49900
 *       500:
 *         description: Failed to create Razorpay order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Razorpay error message
 */
router.post('/create-order', createOrder);

module.exports = router;
