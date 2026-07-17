import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, checkinStepsTable } from "@workspace/db";
import {
  CreateCheckinStepBody,
  UpdateCheckinStepParams,
  UpdateCheckinStepBody,
  UpdateCheckinStepResponse,
  DeleteCheckinStepParams,
  ListCheckinStepsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/checkin-steps", async (_req, res): Promise<void> => {
  const steps = await db
    .select()
    .from(checkinStepsTable)
    .orderBy(asc(checkinStepsTable.order));
  res.json(ListCheckinStepsResponse.parse(steps));
});

router.post("/checkin-steps", async (req, res): Promise<void> => {
  const parsed = CreateCheckinStepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(checkinStepsTable);
  const nextOrder = parsed.data.order ?? existing.length + 1;
  const [step] = await db
    .insert(checkinStepsTable)
    .values({ ...parsed.data, order: nextOrder })
    .returning();
  res.status(201).json(step);
});

router.put("/checkin-steps/:id", async (req, res): Promise<void> => {
  const params = UpdateCheckinStepParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCheckinStepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [step] = await db
    .update(checkinStepsTable)
    .set(parsed.data)
    .where(eq(checkinStepsTable.id, params.data.id))
    .returning();
  if (!step) {
    res.status(404).json({ error: "Step not found" });
    return;
  }
  res.json(UpdateCheckinStepResponse.parse(step));
});

router.delete("/checkin-steps/:id", async (req, res): Promise<void> => {
  const params = DeleteCheckinStepParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [step] = await db
    .delete(checkinStepsTable)
    .where(eq(checkinStepsTable.id, params.data.id))
    .returning();
  if (!step) {
    res.status(404).json({ error: "Step not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
