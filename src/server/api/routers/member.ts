import { createTRPCRouter, protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

export const memberRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const { prisma } = ctx;
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        password: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.user.create({
        data: {
          name: input.name.trim(),
          password: input.password,
          email: input.email.trim(),
        },
      })
    ),

  delete: protectedProcedure

    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.user.delete({ where: { id: input.id } })
    ),
  update: protectedProcedure

    .input(
      z.object({
        id: z.string(),
        name: z.string().trim(),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          password: input.password,
          email: input.email,
        },
      })
    ),
});
