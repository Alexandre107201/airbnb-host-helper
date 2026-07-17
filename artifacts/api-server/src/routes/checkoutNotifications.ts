import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, checkoutNotificationsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/checkout-notifications", async (_req, res): Promise<void> => {
  const [notification] = await db
    .insert(checkoutNotificationsTable)
    .values({})
    .returning();
  res.status(201).json(notification);
});

router.get("/checkout-notifications", async (_req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(checkoutNotificationsTable)
    .where(eq(checkoutNotificationsTable.dismissed, false))
    .orderBy(desc(checkoutNotificationsTable.createdAt));
  res.json(notifications);
});

router.post("/checkout-notifications/:id/dismiss", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [notification] = await db
    .update(checkoutNotificationsTable)
    .set({ dismissed: true })
    .where(eq(checkoutNotificationsTable.id, id))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

export default router;
