import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { userRouter } from "./routes/users";
import { blogRouter } from "./routes/blogs";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();


app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route('api/v1/user', userRouter)
app.route('api/v1/blog', blogRouter)





export default app;
