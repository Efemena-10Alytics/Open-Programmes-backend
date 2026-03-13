import express from "express";
import { applyForScholarship, getScholarshipApplications, syncScholarshipToSheets, syncPaymentToSheets, publicSyncPaymentToSheets, publicSyncScholarshipToSheets } from "../controllers/scholarship";
import { isCourseAdmin } from "../middleware";

export default (router: express.Router) => {
    router.post("/scholarship/apply", applyForScholarship);
    router.get("/scholarship", isCourseAdmin, getScholarshipApplications);
    router.post("/scholarship/sync", isCourseAdmin, syncScholarshipToSheets);
    router.get("/scholarship/sync", isCourseAdmin, syncScholarshipToSheets);
    router.get("/scholarship/sync-public", publicSyncScholarshipToSheets);
    router.post("/payment/sync", isCourseAdmin, syncPaymentToSheets);
    router.get("/payment/sync", isCourseAdmin, syncPaymentToSheets);
    router.get("/payment/sync-public", publicSyncPaymentToSheets);
};
