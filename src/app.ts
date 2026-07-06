import express from "express";
import healthRoutes from "./routes/health.routes.js";
import routes from './routes/index.js'
import { errorMiddleware } from "./middlewares/error.middleware.js";



const app = express();




app.use(express.json());

app.use('/api/v1', healthRoutes);
app.use("/api/v1", routes);

app.use(errorMiddleware);

export default app;
