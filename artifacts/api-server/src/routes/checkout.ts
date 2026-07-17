import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, checkoutStepsTable } from "@workspace/db";
import {
  CreateCheckoutStepBody,
  UpdateCheckoutStepParams,
  UpdateCheckoutStepBody,
  UpdateCheckoutStepResponse,
  DeleteCheckoutStepParams,
  ListCheckoutStepsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/checkout-steps", async (_req, res): Promise<void> => {
  const steps = await db
    .select()
    .from(checkoutStepsTable)
    .orderBy(asc(checkoutStepsTable.order));
  res.json(ListCheckoutStepsResponse.parse(steps));
});

router.post("/checkout-steps", async (req, res): Promise<void> => {
  const parsed = CreateCheckoutStepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(checkoutStepsTable);
  const nextOrder = parsed.data.order ?? existing.length + 1;
  const [step] = await db
    .insert(checkoutStepsTable)
    .values({ ...parsed.data, order: nextOrder })
    .returning();
  res.status(201).json(step);
});

router.put("/checkout-steps/:id", async (req, res): Promise<void> => {
  const params = UpdateCheckoutStepParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCheckoutStepBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [step] = await db
    .update(checkoutStepsTable)
    .set(parsed.data)
    .where(eq(checkoutStepsTable.id, params.data.id))
    .returning();
  if (!step) {
    res.status(404).json({ error: "Step not found" });
    return;
  }
  res.json(UpdateCheckoutStepResponse.parse(step));
});

router.delete("/checkout-steps/:id", async (req, res): Promise<void> => {
  const params = DeleteCheckoutStepParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [step] = await db
    .delete(checkoutStepsTable)
    .where(eq(checkoutStepsTable.id, params.data.id))
    .returning();
  if (!step) {
    res.status(404).json({ error: "Step not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
