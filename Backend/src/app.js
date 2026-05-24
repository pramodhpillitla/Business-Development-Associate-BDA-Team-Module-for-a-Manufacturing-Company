import cors from "cors";
import express from "express";

import activityRoutes from "../routes/activity.routes.js";
import authRoutes from "../routes/auth.routes.js";
import metricsRoutes from "../routes/metrics.routes.js";
import leadRoutes from "../routes/lead.routes.js";
import { errorHandler } from "../middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BDA CRM API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/pipeline", leadRoutes); // Alias for pipeline visualization data
app.use("/api/metrics", metricsRoutes);
app.use("/api", activityRoutes);

app.use(errorHandler);

export default app;
