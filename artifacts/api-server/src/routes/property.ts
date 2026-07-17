import { Router, type IRouter } from "express";
import { db, propertyTable } from "@workspace/db";
import { UpdatePropertyBody, GetPropertyResponse, UpdatePropertyResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/property", async (req, res): Promise<void> => {
  const rows = await db.select().from(propertyTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(propertyTable)
      .values({
        name: "Meu Apartamento",
        address: "",
        description: "",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maxGuests: 2,
        wifiName: "",
        wifiPassword: "",
      })
      .returning();
    res.json(GetPropertyResponse.parse(created));
    return;
  }
  res.json(GetPropertyResponse.parse(rows[0]));
});

router.put("/property", async (req, res): Promise<void> => {
  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid property body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db.select().from(propertyTable).limit(1);
  let result;
  if (rows.length === 0) {
    const [created] = await db.insert(propertyTable).values(parsed.data).returning();
    result = created;
  } else {
    const [updated] = await db
      .update(propertyTable)
      .set(parsed.data)
      .returning();
    result = updated;
  }

  res.json(UpdatePropertyResponse.parse(result));
});

export default router;
