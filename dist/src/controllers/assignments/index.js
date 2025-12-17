"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDownloadSubmissions = exports.deleteAssignment = exports.updateAssignment = exports.createAssignment = exports.gradeSubmission = exports.getAssignmentSubmissions = exports.getAdminAssignments = exports.getStudentAssignments = exports.gradeAssignment = exports.submitAssignment = exports.getAssignments = void 0;
const index_1 = require("../../index");
const handleServerError = (error, res) => {
    console.error({ error_server: error });
    res.status(500).json({ message: "Internal Server Error" });
};
// Get assignments for a cohort course
const getAssignments = async (req, res) => {
    try {
        const { cohortCourseId } = req.params;
        const assignments = await index_1.prismadb.assignment.findMany({
            where: { cohortCourseId },
            include: {
                attachments: true,
                submissions: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' }
        });
        return res.status(200).json({
            status: "success",
            message: null,
            data: assignments
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.getAssignments = getAssignments;
// Submit assignment
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const user = req.user;
        const studentId = user?.id;
        const { content, fileUrl } = req.body;
        // Check if already submitted
        const existingSubmission = await index_1.prismadb.assignmentSubmission.findUnique({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId,
                },
            },
        });
        if (existingSubmission) {
            return res.status(400).json({
                message: "Assignment already submitted"
            });
        }
        const submission = await index_1.prismadb.assignmentSubmission.create({
            data: {
                assignmentId,
                studentId,
                content,
                fileUrl,
            },
            include: {
                assignment: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });
        return res.status(201).json({
            status: "Assignment submitted",
            message: null,
            data: submission,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.submitAssignment = submitAssignment;
// Grade assignment
const gradeAssignment = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback, gradedById } = req.body;
        const submission = await index_1.prismadb.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: grade ? parseInt(grade) : null,
                feedback,
                gradedById,
                gradedAt: new Date(),
            },
            include: {
                assignment: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return res.status(200).json({
            status: "Assignment graded",
            message: null,
            data: submission,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.gradeAssignment = gradeAssignment;
// Get student's assignments
const getStudentAssignments = async (req, res) => {
    try {
        const { studentId, cohortCourseId } = req.params;
        console.log("Fetching assignments for student:", studentId, "in cohort course:", cohortCourseId);
        const assignments = await index_1.prismadb.assignment.findMany({
            where: {
                cohortCourseId,
                OR: [
                    {
                        submissions: {
                            none: {
                                studentId,
                            },
                        },
                    },
                    {
                        submissions: {
                            some: {
                                studentId,
                            },
                        },
                    },
                ],
            },
            include: {
                attachments: true,
                submissions: {
                    where: { studentId },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
        // Format response with submission status
        const formattedAssignments = assignments.map((assignment) => ({
            ...assignment,
            submissionStatus: assignment.submissions.length > 0 ? 'submitted' : 'pending',
            studentSubmission: assignment.submissions[0] || null,
        }));
        return res.status(200).json({
            status: "success",
            message: null,
            data: formattedAssignments,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.getStudentAssignments = getStudentAssignments;
// Get all assignments with submission counts for admin
const getAdminAssignments = async (req, res) => {
    try {
        const assignments = await index_1.prismadb.assignment.findMany({
            include: {
                cohortCourse: {
                    include: {
                        cohort: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                submissions: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                    take: 5, // Only get recent submissions for overview
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.status(200).json({
            status: "success",
            message: null,
            data: assignments,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.getAdminAssignments = getAdminAssignments;
// Get all submissions for a specific assignment
const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await index_1.prismadb.assignmentSubmission.findMany({
            where: {
                assignmentId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                assignment: {
                    include: {
                        cohortCourse: {
                            include: {
                                cohort: true,
                            },
                        },
                    },
                },
                gradedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                submittedAt: 'desc',
            },
        });
        return res.status(200).json({
            status: "success",
            message: null,
            data: submissions,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.getAssignmentSubmissions = getAssignmentSubmissions;
// Grade a submission
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback, gradedById } = req.body;
        const submission = await index_1.prismadb.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: grade ? parseInt(grade) : null,
                feedback,
                gradedById,
                gradedAt: new Date(),
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignment: true,
            },
        });
        return res.status(200).json({
            status: "Submission graded",
            message: null,
            data: submission,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.gradeSubmission = gradeSubmission;
// Create assignment
const createAssignment = async (req, res) => {
    try {
        const { cohortId, title, description, instructions, dueDate, points, cohortCourseModuleId, attachments = [] // Add attachments from request body
         } = req.body;
        console.log("Creating assignment with data:", {
            cohortId,
            title,
            description,
            instructions,
            dueDate,
            points,
            cohortCourseModuleId,
            attachmentsCount: attachments.length
        });
        // First, find the cohort course for this cohort
        const cohortCourse = await index_1.prismadb.cohortCourse.findFirst({
            where: {
                cohortId: cohortId
            }
        });
        if (!cohortCourse) {
            return res.status(404).json({
                message: "Cohort course not found for this cohort"
            });
        }
        console.log("Found cohort course:", cohortCourse.id);
        // If cohortCourseModuleId is provided, verify it exists and belongs to this cohort course
        if (cohortCourseModuleId && cohortCourseModuleId.trim() !== "") {
            const cohortModule = await index_1.prismadb.cohortCourseModule.findFirst({
                where: {
                    id: cohortCourseModuleId,
                    cohortCourseId: cohortCourse.id
                }
            });
            if (!cohortModule) {
                return res.status(404).json({
                    message: "Cohort course module not found or doesn't belong to this cohort course"
                });
            }
            console.log("Linking assignment to module:", cohortModule.title);
        }
        else {
            console.log("Creating general assignment (no specific module)");
        }
        // Create the assignment with attachments in a transaction
        const result = await index_1.prismadb.$transaction(async (tx) => {
            // Create the assignment
            const assignment = await tx.assignment.create({
                data: {
                    cohortCourseId: cohortCourse.id,
                    title,
                    description,
                    instructions,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    points: points ? parseInt(points) : null,
                    cohortCourseModuleId: cohortCourseModuleId && cohortCourseModuleId.trim() !== ""
                        ? cohortCourseModuleId
                        : null,
                },
            });
            console.log("Assignment created:", assignment.id);
            // Create attachment records if any
            if (attachments && attachments.length > 0) {
                console.log("Creating attachments:", attachments.length);
                const attachmentPromises = attachments.map((attachment) => tx.assignmentAttachment.create({
                    data: {
                        name: attachment.name,
                        url: attachment.url,
                        assignmentId: assignment.id,
                    },
                }));
                const createdAttachments = await Promise.all(attachmentPromises);
                console.log("Attachments created:", createdAttachments.length);
            }
            else {
                console.log("No attachments to create");
            }
            // Return the assignment with attachments
            return await tx.assignment.findUnique({
                where: { id: assignment.id },
                include: {
                    cohortCourse: {
                        include: {
                            cohort: true,
                        },
                    },
                    cohortCourseModule: {
                        include: {
                            cohortCourseWeek: true,
                        },
                    },
                    attachments: true,
                },
            });
        });
        console.log("Assignment creation completed successfully");
        return res.status(201).json({
            status: "Assignment created",
            message: null,
            data: result,
        });
    }
    catch (error) {
        console.error("Detailed assignment creation error:", error);
        handleServerError(error, res);
    }
};
exports.createAssignment = createAssignment;
// Update assignment
const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const body = req.body;
        const assignment = await index_1.prismadb.assignment.update({
            where: { id: assignmentId },
            data: {
                ...body,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                points: body.points ? parseInt(body.points) : null,
            },
            include: {
                cohortCourse: {
                    include: {
                        cohort: true,
                    },
                },
            },
        });
        return res.status(200).json({
            status: "Assignment updated",
            message: null,
            data: assignment,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.updateAssignment = updateAssignment;
// Delete assignment
const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        await index_1.prismadb.assignment.delete({
            where: { id: assignmentId },
        });
        return res.status(200).json({
            status: "Assignment deleted",
            message: null,
        });
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.deleteAssignment = deleteAssignment;
// Bulk download submissions
const bulkDownloadSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await index_1.prismadb.assignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                assignment: {
                    select: {
                        title: true,
                    },
                },
            },
        });
        // Create CSV data
        const csvData = [
            ['Student Name', 'Student Email', 'Submission Date', 'Grade', 'Feedback'],
            ...submissions.map(sub => [
                sub.student.name,
                sub.student.email,
                new Date(sub.submittedAt).toLocaleDateString(),
                sub.grade || 'Not graded',
                sub.feedback || 'No feedback'
            ])
        ].map(row => row.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=submissions-${assignmentId}.csv`);
        return res.send(csvData);
    }
    catch (error) {
        handleServerError(error, res);
    }
};
exports.bulkDownloadSubmissions = bulkDownloadSubmissions;
//# sourceMappingURL=index.js.map