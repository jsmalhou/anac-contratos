import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { appUsers } from "@db/schema";
import { eq, desc, and, ne, isNull, or } from "drizzle-orm";

export const appUserRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(appUsers)
      .where(or(eq(appUsers.isActive, 1), isNull(appUsers.isActive)))
      .orderBy(desc(appUsers.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.union([z.number(), z.string()]).transform((v) => Number(v)) }))
    .query(async ({ input }) => {
      const db = getDb();
      const [user] = await db
        .select()
        .from(appUsers)
        .where(eq(appUsers.id, input.id));
      return user || null;
    }),

  create: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        appRole: z.enum([
          "admin",
          "pca",
          "gestor",
          "financeiro",
          "operador",
          "visualizador",
        ]),
        roleId: z.number().optional(),
        departmentId: z.number().optional(),
        password: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check for duplicate name
      const [existing] = await db
        .select()
        .from(appUsers)
        .where(eq(appUsers.fullName, input.fullName));

      if (existing) {
        throw new Error(`Ja existe um utilizador com o nome "${input.fullName}"`);
      }

      const result = await db.insert(appUsers).values({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        avatar: input.avatar || null,
        appRole: input.appRole,
        roleId: input.roleId || null,
        departmentId: input.departmentId || null,
        password: input.password || null,
      } as any);
      return { id: result[0].insertId };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
        fullName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        appRole: z.enum([
          "admin",
          "pca",
          "gestor",
          "financeiro",
          "operador",
          "visualizador",
        ]).optional(),
        roleId: z.number().optional(),
        departmentId: z.number().optional(),
        isActive: z.number().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(appUsers).set(data).where(eq(appUsers.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.union([z.number(), z.string()]).transform((v) => Number(v)) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(appUsers)
        .set({ isActive: 0 })
        .where(eq(appUsers.id, input.id));
      return { success: true };
    }),
});
