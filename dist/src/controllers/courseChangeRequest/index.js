"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseChangeRequest = exports.getAllCourseChangeRequests = exports.getCourseChangeRequestsCount = exports.getUserCourseChangeRequests = exports.createCourseChangeRequest = void 0;
const index_1 = require("../../index");
const createCourseChangeRequest = async (req, res) => {
    try {
        const user = req.user;
        const { currentCourseId, desiredCourseId, reason } = req.body;
        if (!currentCourseId || !desiredCourseId || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check if user has an active payment for the current course
        const paymentStatus = await index_1.prismadb.paymentStatus.findFirst({
            where: {
                userId: user.id,
                courseId: currentCourseId,
                status: {
                    in: ["COMPLETE", "BALANCE_HALF_PAYMENT"]
                }
            }
        });
        if (!paymentStatus) {
            return res.status(400).json({
                message: "You don't have an active payment for this course"
            });
        }
        // Check if desired course exists
        const desiredCourse = await index_1.prismadb.course.findUnique({
            where: { id: desiredCourseId }
        });
        if (!desiredCourse) {
            return res.status(404).json({ message: "Desired course not found" });
        }
        // Check if there's already a pending request for this combination
        const existingRequest = await index_1.prismadb.courseChangeRequest.findFirst({
            where: {
                userId: user.id,
                currentCourseId,
                desiredCourseId,
                status: "PENDING"
            }
        });
        if (existingRequest) {
            return res.status(400).json({
                message: "You already have a pending request for this course change"
            });
        }
        // Create the request
        const request = await index_1.prismadb.courseChangeRequest.create({
            data: {
                userId: user.id,
                currentCourseId,
                desiredCourseId,
                reason,
                paymentStatusId: paymentStatus.id
            },
            include: {
                currentCourse: {
                    select: { title: true }
                },
                desiredCourse: {
                    select: { title: true }
                }
            }
        });
        return res.status(201).json({
            status: "success",
            message: "Course change request submitted successfully",
            data: request
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.createCourseChangeRequest = createCourseChangeRequest;
const getUserCourseChangeRequests = async (req, res) => {
    try {
        const user = req.user;
        const requests = await index_1.prismadb.courseChangeRequest.findMany({
            where: { userId: user.id },
            include: {
                currentCourse: {
                    select: { title: true, imageUrl: true }
                },
                desiredCourse: {
                    select: { title: true, imageUrl: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json({
            status: "success",
            data: requests
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getUserCourseChangeRequests = getUserCourseChangeRequests;
const getCourseChangeRequestsCount = async (req, res) => {
    try {
        const { status } = req.query;
        // Build where clause based on query parameters
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        // Get counts for all statuses if no specific status is requested
        if (!status) {
            const counts = await index_1.prismadb.courseChangeRequest.groupBy({
                by: ['status'],
                where: whereClause,
                _count: {
                    id: true,
                },
            });
            // Format the response
            const result = {
                total: counts.reduce((sum, item) => sum + item._count.id, 0),
                byStatus: counts.reduce((acc, item) => {
                    acc[item.status] = item._count.id;
                    return acc;
                }, {}),
            };
            return res.status(200).json({
                status: "success",
                data: result
            });
        }
        // Get count for specific status
        const count = await index_1.prismadb.courseChangeRequest.count({
            where: whereClause,
        });
        return res.status(200).json({
            status: "success",
            data: {
                count,
                status: status
            }
        });
    }
    catch (error) {
        console.error("Error getting course change requests count:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getCourseChangeRequestsCount = getCourseChangeRequestsCount;
const getAllCourseChangeRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = status
            ? { status: status }
            : {};
        const requests = await index_1.prismadb.courseChangeRequest.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true, email: true, phone_number: true }
                },
                currentCourse: {
                    select: { title: true, imageUrl: true }
                },
                desiredCourse: {
                    select: { title: true, imageUrl: true }
                },
                processedBy: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json({
            status: "success",
            data: requests
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getAllCourseChangeRequests = getAllCourseChangeRequests;
const updateCourseChangeRequest = async (req, res) => {
    try {
        const user = req.user;
        const { requestId } = req.params;
        const { status, adminReason } = req.body;
        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        if (status === "REJECTED" && !adminReason) {
            return res.status(400).json({
                message: "Reason is required when rejecting a request"
            });
        }
        const request = await index_1.prismadb.courseChangeRequest.findUnique({
            where: { id: requestId },
            include: {
                paymentStatus: {
                    include: {
                        cohort: true
                    }
                },
                user: true
            }
        });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (request.status !== "PENDING") {
            return res.status(400).json({
                message: "This request has already been processed"
            });
        }
        // Update the request
        const updatedRequest = await index_1.prismadb.courseChangeRequest.update({
            where: { id: requestId },
            data: {
                status,
                adminReason,
                processedById: user.id,
                processedAt: new Date()
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                currentCourse: {
                    select: { title: true }
                },
                desiredCourse: {
                    select: { title: true }
                },
                processedBy: {
                    select: { name: true }
                },
                paymentStatus: {
                    include: {
                        cohort: true
                    }
                }
            }
        });
        // If approved, update the user's course and payment status
        if (status === "APPROVED") {
            // Find the desired course to get its details
            const desiredCourse = await index_1.prismadb.course.findUnique({
                where: { id: request.desiredCourseId }
            });
            if (!desiredCourse) {
                return res.status(404).json({ message: "Desired course not found" });
            }
            // Start transaction for multiple operations
            await index_1.prismadb.$transaction(async (tx) => {
                // Update payment status to point to the new course
                await tx.paymentStatus.update({
                    where: { id: request.paymentStatusId },
                    data: {
                        courseId: request.desiredCourseId,
                        // Reset cohort if changing to a different course
                        cohortId: null
                    }
                });
                // Update user's ongoing courses
                await tx.user.update({
                    where: { id: request.userId },
                    data: {
                        ongoing_courses: {
                            set: request.user.ongoing_courses.filter(id => id !== request.currentCourseId).concat(request.desiredCourseId)
                        }
                    }
                });
                // Remove from current cohort if enrolled
                await tx.userCohort.updateMany({
                    where: {
                        userId: request.userId,
                        courseId: request.currentCourseId
                    },
                    data: {
                        isActive: false,
                        isPaymentActive: false,
                        archivedAt: new Date()
                    }
                });
                // Remove purchase record for old course
                await tx.purchase.deleteMany({
                    where: {
                        userId: request.userId,
                        courseId: request.currentCourseId
                    }
                });
                // Create new purchase record for desired course
                await tx.purchase.create({
                    data: {
                        userId: request.userId,
                        courseId: request.desiredCourseId
                    }
                });
            });
        }
        return res.status(200).json({
            status: "success",
            message: `Request ${status.toLowerCase()} successfully`,
            data: updatedRequest
        });
    }
    catch (error) {
        console.error("Error updating course change request:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateCourseChangeRequest = updateCourseChangeRequest;
//# sourceMappingURL=index.js.map