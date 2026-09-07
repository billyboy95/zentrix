const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health");
const agentRoutes = require("./routes/agents");
const taskRoutes = require("./routes/tasks");
const themeRoutes = require("./routes/themes");
const storeRoutes = require("./routes/stores");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api/health", healthRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/stores", storeRoutes);

app.use(errorHandler);

module.exports = app;
