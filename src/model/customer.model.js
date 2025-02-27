const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String,
  },
  { timestamps: true } // Auto-adds createdAt & updatedAt
);

module.exports = mongoose.model("Customer", customerSchema);
