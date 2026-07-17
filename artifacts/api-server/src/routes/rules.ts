import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, rulesTable } from "@workspace/db";
import {
  CreateRuleBody,
  UpdateRuleParams,
  UpdateRuleBody,
  UpdateRuleResponse,
  DeleteRuleParams,
  ListRulesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/rules", async (_req, res): Promise<void> => {
  const rules = await db
    .select()
    .from(rulesTable)
    .orderBy(asc(rulesTable.order));
  res.json(ListRulesResponse.parse(rules));
});

router.post("/rules", async (req, res): Promise<void> => {
  const parsed = CreateRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(rulesTable);
  const nextOrder = parsed.data.order ?? existing.length + 1;
  const [rule] = await db
    .insert(rulesTable)
    .values({ ...parsed.data, order: nextOrder })
    .returning();
  res.status(201).json(rule);
});

router.put("/rules/:id", async (req, res): Promise<void> => {
  const params = UpdateRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [rule] = await db
    .update(rulesTable)
    .set(parsed.data)
    .where(eq(rulesTable.id, params.data.id))
    .returning();
  if (!rule) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }
  res.json(UpdateRuleResponse.parse(rule));
});

router.delete("/rules/:id", async (req, res): Promise<void> => {
  const params = DeleteRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [rule] = await db
    .delete(rulesTable)
    .where(eq(rulesTable.id, params.data.id))
    .returning();
  if (!rule) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
