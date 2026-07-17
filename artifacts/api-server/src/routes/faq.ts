import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, faqItemsTable } from "@workspace/db";
import { ListFaqItemsResponse, ListFaqItemsResponseItem, CreateFaqItemBody, UpdateFaqItemBody, UpdateFaqItemResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/faq", async (_req, res): Promise<void> => {
  const rows = await db.select().from(faqItemsTable).orderBy(asc(faqItemsTable.order));
  res.json(ListFaqItemsResponse.parse(rows));
});

router.post("/faq", async (req, res): Promise<void> => {
  const parsed = CreateFaqItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid FAQ item body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(faqItemsTable).values(parsed.data).returning();
  res.status(201).json(ListFaqItemsResponseItem.parse(created));
});

router.put("/faq/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateFaqItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid FAQ item body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db.update(faqItemsTable).set(parsed.data).where(eq(faqItemsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(UpdateFaqItemResponse.parse(updated));
});

router.delete("/faq/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(faqItemsTable).where(eq(faqItemsTable.id, id));
  res.status(204).send();
});

export default router;
