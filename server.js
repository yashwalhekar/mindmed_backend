require('dotenv').config();
const express = require('express');

const bodyParser = require('body-parser');

const cors = require("cors");
const customerRoutes = require("./src/routes/customer.routes")
const app = express();


app.use(cors()); 

app.use(bodyParser.json());


app.use("/api/",customerRoutes)
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
  });

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
