const Customer = require("../model/customer.model");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email to Customer
const sendMailToCustomer = (name, email, message) => ({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Form Submission Received",
  text: `Hello ${name},\n\nWe received your message: "${message}".\n\nThank you!`,
});

// Email to Admin
const sendMailToHost = (name, email, phone, message) => ({
  from: process.env.EMAIL_USER,
  to: process.env.ADMIN_EMAIL,
  subject: "New Contact Form Submission",
  text: `You have received a new message from a customer.\n\n
    Name: ${name}\n
    Email: ${email}\n
    Phone: ${phone}\n
    Message: ${message}\n\n
    Please respond as soon as possible.`,
});

// Controller Function with Rate Limiting
const customerDetails = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Get messages from the past 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const messageCount = await Customer.countDocuments({
      email,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (messageCount >= 5) {
      return res
        .status(429)
        .json({
          error: "Limit exceeded: You can only send 5 messages per day!",
        });
    }

    // Store in MongoDB
    const customer = new Customer({ name, email, phone, message });
    await customer.save();
    console.log("✅ Customer saved to database:", customer);

    try {
      // Send emails concurrently
      await Promise.all([
        transporter.sendMail(sendMailToCustomer(name, email, message)),
        transporter.sendMail(sendMailToHost(name, email, phone, message)),
      ]);

      console.log("📧 Emails sent successfully");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      return res
        .status(500)
        .json({ error: "Failed to send email, but data saved!" });
    }

    res
      .status(200)
      .json({
        message: "Information stored successfully & emails sent!",
        customer,
      });
  } catch (error) {
    console.error("❌ Database error:", error.message);
    res.status(500).json({ error: "Failed to store information!" });
  }
};

module.exports = { customerDetails };
