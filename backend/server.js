const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const valveRoutes = require("./routes/index"); // <-- points to routes/index.js

app.use(cors());
app.use(bodyParser.json());
app.use("/api", valveRoutes); // <--- ✅ This mounts your routes with /api prefix

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
