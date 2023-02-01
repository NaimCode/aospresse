import {createTRPCRouter, protectedProcedure, publicProcedure} from "@server/api/trpc";
import {z} from "zod";

export const memberRouter = createTRPCRouter({
    getAll: protectedProcedure
        .query(({ ctx }) => {
            const {prisma}=ctx
          return prisma.user.findMany({orderBy:{createdAt:"desc"}});
        }),


});
