const express = require('express');
const router = express.Router();
const { confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); // ✅ Destructure properly

router.post('/confirm', protect, confirmPayment); // ✅ Use protect middleware
// router.post('/showtime/:id', protect, confirmPayment);
module.exports = router;
