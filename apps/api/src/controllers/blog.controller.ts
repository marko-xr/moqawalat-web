import type { Request, Response } from "express";
import { body } from "express-validator";
import { prisma } from "../services/prisma.js";

export const blogValidation = [
  body("titleAr").isLength({ min: 3 }),
  body("slug").isSlug(),
  body("excerptAr").isLength({ min: 10 }),
  body("contentAr").isLength({ min: 50 })
];

export async function getBlogPosts(req: Request, res: Response) {
  const isAdmin = req.query.all === "true";

  const posts = await prisma.blogPost.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" }
  });

  return res.json(posts);
}

export async function getBlogBySlug(req: Request, res: Response) {
  const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });

  if (!post) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  return res.json(post);
}

export async function createBlogPost(req: Request, res: Response) {
  const post = await prisma.blogPost.create({ data: req.body });
  return res.status(201).json(post);
}

export async function updateBlogPost(req: Request, res: Response) {
  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: req.body
  });

  return res.json(post);
}

export async function deleteBlogPost(req: Request, res: Response) {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
