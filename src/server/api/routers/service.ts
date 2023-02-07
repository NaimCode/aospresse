import {createTRPCRouter, protectedProcedure} from "@server/api/trpc";
import {z} from "zod";

export const serviceRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ctx}) => {
        const {prisma} = ctx;
        return prisma.service.findMany({include:{category:true},orderBy: {createdAt: "desc"}});
    }),
    add: protectedProcedure
        .input(
            z.object({
                activite: z.string().trim(),
                forChild: z.boolean(),
                categoryId: z.string(),
                description:z.string().optional(),
            })
        )
        .mutation(({input, ctx}) =>
            ctx.prisma.service.create({
                data: input,
            })
        ),

    delete: protectedProcedure

        .input(z.object({id: z.string()}))
        .mutation(({input, ctx}) =>
            ctx.prisma.service.delete({where: {id: input.id}})
        ),
    update: protectedProcedure

        .input(
            z.object({
                id: z.string(),
                activite: z.string().trim(),
                forChild: z.boolean(),
                categoryId: z.string(),
                description:z.string().optional(),
            })
        )
        .mutation(({input, ctx}) =>
            ctx.prisma.service.update({
                where: {id: input.id},
                data: input,
            })
        ),
});
