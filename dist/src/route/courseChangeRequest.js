"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middleware_1 = require("../middleware");
const courseChangeRequest_1 = require("../controllers/courseChangeRequest");
exports.default = (router) => {
    router.post("/course-change-request", middleware_1.isLoggedIn, courseChangeRequest_1.createCourseChangeRequest);
    router.get("/course-change-requests", middleware_1.isLoggedIn, courseChangeRequest_1.getUserCourseChangeRequests);
    router.get("/admin/course-change-requests/count", middleware_1.isAdmin, courseChangeRequest_1.getCourseChangeRequestsCount);
    router.get("/admin/course-change-requests", middleware_1.isAdmin, courseChangeRequest_1.getAllCourseChangeRequests);
    router.patch("/admin/course-change-requests/:requestId", middleware_1.isAdmin, courseChangeRequest_1.updateCourseChangeRequest);
};
//# sourceMappingURL=courseChangeRequest.js.map