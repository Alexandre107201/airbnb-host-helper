import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertyRouter from "./property";
import checkinRouter from "./checkin";
import checkoutRouter from "./checkout";
import rulesRouter from "./rules";
import localTipsRouter from "./localTips";
import faqRouter from "./faq";
import guestPortalRouter from "./guestPortal";
import storageRouter from "./storage";
import guestsRouter from "./guests";
import checkoutNotificationsRouter from "./checkoutNotifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertyRouter);
router.use(checkinRouter);
router.use(checkoutRouter);
router.use(rulesRouter);
router.use(localTipsRouter);
router.use(faqRouter);
router.use(guestPortalRouter);
router.use(storageRouter);
router.use(guestsRouter);
router.use(checkoutNotificationsRouter);

export default router;
