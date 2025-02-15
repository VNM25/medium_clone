import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string
    }
}>();

blogRouter.use("/*", async (c, next) => {
    const headers = c.req.header();
    console.log("🚀 ~ blogRouter.use ~ headers:", headers.authorization)
    const jwt = headers.authorization.split(' ')[1];
    const user = await verify(jwt, c.env.JWT_SECRET)

    console.log(jwt, user);
    if (!user) {
        c.status(401);
        return c.json({ error: 'unauthorized' })
    }
    //@ts-ignore
    c.set('userId', user.id)
    await next();
})

blogRouter.post("/", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = c.get('userId')
    const body = await c.req.json();
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId
        }
    })
    console.log(post);
    return c.json({
        id: post.id
    })
});

blogRouter.put("/", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = c.get('userId')
    const body = await c.req.json();
    const post = await prisma.post.update({
        where: {
            id: body.id,
            authorId: userId
        },
        data: {
            title: body.title,
            content: body.content,
        }
    })
    console.log(post);
    return c.json({
        id: post.id,
        message: 'Post Updated'
    })
});
blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const post = await prisma.post.findMany({})
    console.log(post);
    c.status(200);
    return c.json(post)
});

blogRouter.get("/:id", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = c.get('userId')
    const id = c.req.param("id");
    const post = await prisma.post.findUnique({
        where: {
            id: id,
        },
        select: {
            id: true,
            title: true,
            content: true,
            published: true,
            author: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    })

    if (!post) {
        c.status(404);
        return c.json({
            message: 'Post not found'
        })
    }
    console.log(post);
    c.status(200);
    return c.json(post)
});
