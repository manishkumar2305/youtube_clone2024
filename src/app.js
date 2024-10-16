import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// config middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import playListRoutes from "./routes/playlist.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

// Routes declartion
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/playlist", playListRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

export { app };
