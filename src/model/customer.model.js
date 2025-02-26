const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
  phone: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
