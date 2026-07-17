import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, propertyTable, checkinStepsTable, checkoutStepsTable, rulesTable, localTipsTable, faqItemsTable } from "@workspace/db";
import { GetGuestPortalResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/guest-portal", async (_req, res): Promise<void> => {
  const [propertyRows, checkinSteps, checkoutSteps, rules, localTips, faqItems] = await Promise.all([
    db.select().from(propertyTable).limit(1),
    db.select().from(checkinStepsTable).orderBy(asc(checkinStepsTable.order)),
    db.select().from(checkoutStepsTable).orderBy(asc(checkoutStepsTable.order)),
    db.select().from(rulesTable).orderBy(asc(rulesTable.order)),
    db.select().from(localTipsTable),
    db.select().from(faqItemsTable).orderBy(asc(faqItemsTable.order)),
  ]);

  let property = propertyRows[0];
  if (!property) {
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
    property = created;
  }

  res.json(
    GetGuestPortalResponse.parse({
      property,
      checkinSteps,
      checkoutSteps,
      rules,
      localTips,
      faqItems,
    })
  );
});

export default router;
