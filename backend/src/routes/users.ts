import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
        },
      });
      console.log(user);
      let token = await sign({ id: user.id }, c.env.JWT_SECRET);
      return c.json({ token });
    } catch (error) {
      return c.status(403);
    }
  });
  
  userRouter.post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
        select: {
          password: true,
          email: true,
          id: true
        },
      });
      console.log(user);
      if (!user) {
        c.status(403);
        return c.json({ message: "Invalid email or password" });
      }
      if (user.password == body.password) {
        let token = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ token });
      }
      c.status(403);
      return c.json({ message: "Invalid email or password" });
    } catch (error) {
      return c.status(403);
    }
  });