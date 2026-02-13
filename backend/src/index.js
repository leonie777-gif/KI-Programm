const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000;

const patientsRoutes = require("./routes/patients");
const documentationRoutes = require("./routes/documentation");
const groupsRoutes = require("./routes/groups");
const aiRoutes = require("./routes/ai");

app.use(cors());
app.use(bodyParser.json());

app.use("/api/patients", patientsRoutes);
app.use("/api/documentation", documentationRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
