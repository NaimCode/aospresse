import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import {memberRouter} from "@server/api/routers/member";
import { categoryRouter } from "./routers/category";
import {serviceRouter} from "@server/api/routers/service";
import { adherentRouter } from "./routers/adherent";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
 member:memberRouter,
 category:categoryRouter,
 service: serviceRouter,
 adherent:adherentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
