const db = require("../config/db");

const createTable = async () => {
  try {
    const sql = `CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(100),
      phone VARCHAR(20),
      message MEDIUMTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.query(sql);
    console.log("✅ Coustomer table checked/created successfully");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
};

createTable().catch((err) => console.error("Error creating table:", err));

exports.createCustomer = async (name,email,phone,message) => {
  try {
    const sql = `INSERT INTO customers (name,email,phone,message) 
    VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      name,
      email,
      phone,
      message
    ]);
    return result;
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
};

