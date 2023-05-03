/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DATE_FORMAT } from "@config/index";
import { createTRPCRouter, protectedProcedure } from "@server/api/trpc";
import moment from "moment";
import { z } from "zod";

const ZAdherentImport = z.object({
  name: z.string(),
  email: z.string().optional(),
  sexe: z.enum(["M", "F"]).optional(),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  familyStatus: z.enum(["C", "M","D","V"]).optional(),
  childrenNumber: z.number().optional(),
  tel: z.string().optional(),
  profession: z.string().optional(),
  lieuTravail: z.string().optional(),
  cin: z.string().optional(),
  identifiant: z.string().optional(),
  identifiant2: z.string().optional(),
  anneeTravail: z.string().optional(),
  isPaid: z.boolean(),
  sifa:z.enum(['A','P']).optional(),
  num:z.number().optional(),
  ville: z.string().optional(),
  address:z.string().optional(),
  photoId: z.string().optional(),
  createdAt:z.string().optional(),
  dateDebutAbonnement: z.string().optional(),
  dateNouvelAbonnement: z.string().optional(),
});
const ZAdherent = z.object({
  name: z.string(),
  email: z.string(),
  sexe: z.enum(["M", "F"]),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  familyStatus: z.enum(["C", "M","D","V"]),
  childrenNumber: z.number().optional(),
  tel: z.string().optional(),
  profession: z.string().optional(),
  lieuTravail: z.string().optional(),
  cin: z.string(),
  identifiant: z.string().optional(),
 ville: z.string().optional(),
  identifiant2: z.string().optional(),
  anneeTravail: z.string().optional(),
  isPaid: z.boolean(),
  sifa:z.enum(['A','P']),
  num:z.number().optional(),
  address:z.string().optional(),
  photoId: z.string(),
  
  createAt:z.string().optional(),
  dateDebutAbonnement: z.string(),
});
export const adherentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async({ ctx }) => {
    const { prisma } = ctx;
    const [adherents,services] = await prisma.$transaction([
      prisma.adherent.findMany({
        orderBy: { createdAt: "desc" }}),
        prisma.service.findMany()
      ])


    return adherents

    

  }),
  add: protectedProcedure.input(ZAdherent).mutation(({ input, ctx }) => {

    const dateNouvelAbonnement = moment(moment(input.dateDebutAbonnement).format(DATE_FORMAT)).add(1, "year").format(DATE_FORMAT);
    return ctx.prisma.adherent.create({
      data: {
        ...input,
        dateNouvelAbonnement
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

    .mutation(({ input, ctx }) =>{
      const dateNouvelAbonnement = moment(input.dateDebutAbonnement).add(1, "year").format(DATE_FORMAT);
      return ctx.prisma.adherent.update({
        where: { id: input.id },
        data: {
          ...input,
          dateNouvelAbonnement,
       
        },
      })
    }
    ),

    import: protectedProcedure

    .input(z.array(ZAdherentImport))

    .mutation(({ input, ctx }) =>{
     // const dateNouvelAbonnement = moment(input.dateDebutAbonnement).add(1, "year").format("DD-MM-YYYY");
      return ctx.prisma.adherent.createMany({
        data: input.map((adherent) => ({
          ...adherent,
          dateNouvelAbonnement:adherent.dateNouvelAbonnement?adherent.dateNouvelAbonnement:moment(adherent.dateDebutAbonnement).add(1, "year").format(DATE_FORMAT),
        })),
        skipDuplicates: true,
      })
    }
    ),
  // addService: protectedProcedure
  //   .input(z.object({ id: z.string(), serviceId: z.string() }))
  //   .mutation(({ input, ctx }) =>
  //     ctx.prisma.adherent.update({
  //       where: { id: input.id },
  //       data: {
  //         servicesId: {
  //          push: input.serviceId,
  //         },
  //       },
  //     })
  //   ),
  // deleteService: protectedProcedure
  //   .input(z.object({ id: z.string(), serviceId: z.string(),ids:z.array(z.string()) }))
  //   .mutation(({ input, ctx }) =>
  //     ctx.prisma.adherent.update({
  //       where: { id: input.id },
  //       data: {
  //         servicesId: input.ids.filter((id) => id !== input.serviceId),
  //       },
  //     })
  //   ),
});
