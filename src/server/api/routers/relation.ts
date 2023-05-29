/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createTRPCRouter, protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

export const relationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const { prisma } = ctx;
    return prisma.relation.findMany({include:{adherent:true,service:true}, orderBy: { createdAt: "desc" } });
  }),
  add: protectedProcedure
    .input(
      z.object({
        adherentId: z.string(),
        serviceId: z.string(),
        montant: z.string(),
        description: z.string().optional(),
        date:z.string().optional()
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.relation.create({
        data: input,
      })
    ),

  delete: protectedProcedure

    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.relation.delete({ where: { id: input.id } })
    ),
  update: protectedProcedure

    .input(
      z.object({
              id: z.string(),
            adherentId: z.string(),
            serviceId: z.string(),
            montant: z.string(),
            date:z.string().optional(),
            description: z.string().optional(),
          
      })
    )
    .mutation(({ input, ctx }) =>
      ctx.prisma.relation.update({
        where: { id: input.id },
        data: input,
      })
    ),
});
