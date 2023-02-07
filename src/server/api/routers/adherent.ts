import { createTRPCRouter, protectedProcedure } from "@server/api/trpc";
import { z } from "zod";

const ZAdherent = z.object({
  name: z.string(),
  email: z.string().email(),
  sexe: z.enum(["M", "F"]),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  familyStatus: z.enum(["C", "M"]),
  children: z.number().optional(),
  tel: z.string().optional(),
  profession: z.string().optional(),
  lieuTravail: z.string().optional(),
  cin: z.string(),
  identifiant: z.string().optional(),
  anneeTravail: z.string().optional(),
  isPaid: z.boolean(),
  dateDebutAbonnement: z.string().optional(),
  dateNouvelAbonnement: z.string().optional(),
  services: z.array(z.object({ id: z.string() })),
});
export const adherentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    const { prisma } = ctx;
    return prisma.adherent.findMany({
      include: { services: true },
      orderBy: { createdAt: "desc" },
    });
  }),
  add: protectedProcedure.input(ZAdherent).mutation(({ input, ctx }) => {
    return ctx.prisma.adherent.create({
      data: {
        ...input,
        services: {
          connect: input.services,
        },
      },
    });
  }),

  delete: protectedProcedure

    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.adherent.delete({ where: { id: input.id } })
    ),
  update: protectedProcedure

    .input(z.object({ id: z.string() }).merge(ZAdherent))

    .mutation(({ input, ctx }) =>
      ctx.prisma.adherent.update({
        where: { id: input.id },
        data: {
          ...input,
          services: {
            connect: input.services,
          },
        },
      })
    ),

  addService: protectedProcedure
    .input(z.object({ id: z.string(), serviceId: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.adherent.update({
        where: { id: input.id },
        data: {
          services: {
            connect: { id: input.serviceId },
          },
        },
      })
    ),
  deleteService: protectedProcedure
    .input(z.object({ id: z.string(), serviceId: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.prisma.adherent.update({
        where: { id: input.id },
        data: {
          services: {
            disconnect: { id: input.serviceId },
          },
        },
      })
    ),
});