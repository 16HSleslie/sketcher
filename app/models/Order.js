const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const CustomOrderDetailsSchema = new Schema({
  specifications: {
    type: String,
    required: true
  },
  requiredMaterials: {
    type: String
  },
  estimatedCompletionTime: {
    type: String
  },
  additionalNotes: {
    type: String
  }
});

const OrderSchema = new Schema({
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  items: [OrderItemSchema],
  isCustomOrder: {
    type: Boolean,
    default: false
  },
  customOrderDetails: CustomOrderDetailsSchema,
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  trackingNumber: {
    type: String
  },
});

module.exports = mongoose.model('Order', OrderSchema); 