import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, localTipsTable } from "@workspace/db";
import {
  CreateLocalTipBody,
  UpdateLocalTipParams,
  UpdateLocalTipBody,
  UpdateLocalTipResponse,
  DeleteLocalTipParams,
  ListLocalTipsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/local-tips", async (_req, res): Promise<void> => {
  const tips = await db.select().from(localTipsTable);
  res.json(ListLocalTipsResponse.parse(tips));
});

router.post("/local-tips", async (req, res): Promise<void> => {
  const parsed = CreateLocalTipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tip] = await db.insert(localTipsTable).values(parsed.data).returning();
  res.status(201).json(tip);
});

router.put("/local-tips/:id", async (req, res): Promise<void> => {
  const params = UpdateLocalTipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLocalTipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tip] = await db
    .update(localTipsTable)
    .set(parsed.data)
    .where(eq(localTipsTable.id, params.data.id))
    .returning();
  if (!tip) {
    res.status(404).json({ error: "Tip not found" });
    return;
  }
  res.json(UpdateLocalTipResponse.parse(tip));
});

router.delete("/local-tips/:id", async (req, res): Promise<void> => {
  const params = DeleteLocalTipParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [tip] = await db
    .delete(localTipsTable)
    .where(eq(localTipsTable.id, params.data.id))
    .returning();
  if (!tip) {
    res.status(404).json({ error: "Tip not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
