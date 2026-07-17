import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, guestsTable } from "@workspace/db";
import {
  CreateGuestBody,
  UpdateGuestParams,
  UpdateGuestBody,
  DeleteGuestParams,
  ListGuestsResponse,
  GetGuestParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/guests", async (_req, res): Promise<void> => {
  const guests = await db
    .select()
    .from(guestsTable)
    .orderBy(desc(guestsTable.checkIn));
  res.json(ListGuestsResponse.parse(guests));
});

router.get("/guests/:id", async (req, res): Promise<void> => {
  const params = GetGuestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [guest] = await db
    .select()
    .from(guestsTable)
    .where(eq(guestsTable.id, params.data.id));
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  res.json(guest);
});

router.post("/guests", async (req, res): Promise<void> => {
  const parsed = CreateGuestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [guest] = await db
    .insert(guestsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(guest);
});

router.put("/guests/:id", async (req, res): Promise<void> => {
  const params = UpdateGuestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGuestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [guest] = await db
    .update(guestsTable)
    .set(parsed.data)
    .where(eq(guestsTable.id, params.data.id))
    .returning();
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  res.json(guest);
});

router.delete("/guests/:id", async (req, res): Promise<void> => {
  const params = DeleteGuestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [guest] = await db
    .delete(guestsTable)
    .where(eq(guestsTable.id, params.data.id))
    .returning();
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
