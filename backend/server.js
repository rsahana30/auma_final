const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const index = require("./routes/index"); // <-- points to routes/index.js
const valveRoutes = require("./routes/valveRoutes");
app.use(cors());
app.use(bodyParser.json());

app.use("/api", index);

app.use("/api", valveRoutes); // <--- ✅ This mounts your routes with /api prefix

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
