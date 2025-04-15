const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middlewares/auth');

// @route   GET api/orders
// @desc    Get all orders
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders
// @desc    Create an order
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      isCustomOrder,
      customOrderDetails,
      total,
      paymentMethod
    } = req.body;

    const newOrder = new Order({
      customer,
      items,
      isCustomOrder,
      customOrderDetails,
      total,
      paymentMethod
    });

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders/custom
// @desc    Create a custom order
// @access  Public
router.post('/custom', async (req, res) => {
  try {
    const {
      customer,
      customOrderDetails,
      total,
      paymentMethod
    } = req.body;

    const newOrder = new Order({
      customer,
      isCustomOrder: true,
      customOrderDetails,
      total,
      paymentMethod,
      items: [] // Custom orders may not have standard product items
    });

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: status || order.status,
        paymentStatus: paymentStatus || order.paymentStatus,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/orders/:id
// @desc    Delete an order
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 