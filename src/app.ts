import express from "express";
import healthRoutes from "./routes/health.routes.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173",
        //   "http://192.168.1.101:5173",
        ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1", healthRoutes);
app.use("/api/v1", routes);

app.use(errorMiddleware);

export default app;
