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
const sendMailToCustomer = (name, email, id, currentDate) => ({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Form Submission Received",
  text: `Dear ${name},

Thank you for reaching out to Mindmed Innovations. We have received your inquiry regarding Service ID: ${id} on ${currentDate}. Our team is currently reviewing your request, and we will provide a response within 3 business days.

If you require any further information in the meantime, please feel free to contact us at
contact@mindmedinnovations.com
Phone Number: 9075559311

We appreciate your patience and look forward to assisting you.

Best regards,  
Minal Bhuyekar  
MindMed Innovations  
minal@mindmedinnovations.com`,
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
      return res.status(429).json({
        error: "Limit exceeded: You can only send 5 messages per day!",
      });
    }

    // Store in MongoDB
    const customer = new Customer({ name, email, phone, message });
    await customer.save();
    console.log("✅ Customer saved to database:", customer);

    const id = customer._id; // Get the ID from MongoDB
    const currentDate = new Date(customer.createdAt).toLocaleString(); // Format the created date

    try {
      // Send emails concurrently
      await Promise.all([
        transporter.sendMail(sendMailToCustomer(name, email, id, currentDate)),
        transporter.sendMail(sendMailToHost(name, email, phone, message)),
      ]);

      console.log("📧 Emails sent successfully");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      return res
        .status(500)
        .json({ error: "Failed to send email, but data saved!" });
    }

    res.status(200).json({
      message: "Information stored successfully & emails sent!",
      customer: { id, createdAt: customer.createdAt }, // Return ID and createdAt
    });
  } catch (error) {
    console.error("❌ Database error:", error.message);
    res.status(500).json({ error: "Failed to store information!" });
  }
};

module.exports = { customerDetails };
