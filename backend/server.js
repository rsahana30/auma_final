const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const index = require("./routes/index"); // <-- points to routes/index.js
const valveRoutes = require("./routes/valveRoutes");
const data=require("./routes/data");
const config=require("./routes/config");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/authMiddleware");
app.use(cors());
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api", authMiddleware, index);
app.use("/api", authMiddleware, valveRoutes);
app.use("/api", authMiddleware, data) 
app.use("/api", authMiddleware, config);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
