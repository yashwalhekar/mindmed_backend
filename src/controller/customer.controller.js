const { createCustomer } = require("../model/customer.model");
const nodemailer = require("nodemailer")



const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  

  const sendMailOptions = (name,email,message)=>{
    return  {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Form Submission Received",
        text: `Hello ${name},\n\nWe received your message: "${message}".\n\nThank you!`,
      };
  }

const customerDetails= async(req,res)=>{
  try {
    const {name,email,phone,message} =req.body;
    const response = await createCustomer(name,email,phone,message);
      await transporter.sendMail(sendMailOptions(name,email,message));
      res.json({ message: "Form submitted & email sent!" });
    res.status(200).json({message:"Information stored successfully!",response})
  } catch (error) {
    res.status(400).json({error:error.message})
  }
}




module.exports = {customerDetails}