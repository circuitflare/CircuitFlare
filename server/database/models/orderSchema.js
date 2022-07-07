const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  billingInfo: [],
  deliveryInfo: {
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
      required: true,
    },
    attention: {
      type: String,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    company: {
      type: String,
    },
    zipCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
  },

  cartItems: [],
  userId: {
    type: String,
    ref: "User",
    required: true,
  },

  paidAt: {
    type: Date,
    required: true,
  },

  totalBasketAmount: {
    type: Number,
    required: true,
  },
  totalTransactionAmount: {
    type: Number,
    required: true,
  },
  totalDiscountAmount: {
    type: Number,
    required: true,
  },
  totalBasketItems: {
    type: Number,
    required: true,
  },

  paymentStatus: {
    type: String,
    required: true,
    default: "Order Placed",
  },

  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  orderNumber: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    default: "-",
  },
  remarks:[],
  razorpay_payment_id: String,

  deliveredAt: Date,

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", orderSchema);
