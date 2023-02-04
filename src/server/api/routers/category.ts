/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createTRPCRouter, protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const { prisma } = ctx;
    return prisma.category.findMany({ orderBy: { createdAt: "desc" } });
  }),
  add: protectedProcedure
    .input(
      z.object({
        color: z.string().optional(),
        name: z.string().trim(),
        description: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.category.create({
        data: input,
      })
    ),

  delete: protectedProcedure

    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.category.delete({ where: { id: input.id } })
    ),
  update: protectedProcedure

    .input(
      z.object({
        id: z.string(),
        name: z.string().trim(),
        color: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.category.update({
        where: { id: input.id },
        data: input,
      })
    ),
});
