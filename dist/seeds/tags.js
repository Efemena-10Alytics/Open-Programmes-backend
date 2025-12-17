"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
    try {
        await database.tag.createMany({
            data: [
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Process Mapping" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Stakeholder Engagement",
                },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Requirements Gathering",
                },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Data Analytics" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Business Process Improvement",
                },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Power BI" },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "SQL" },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Scrum" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Process Documentation",
                },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Process Optimization",
                },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Agile Methodology" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Project Management",
                },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Data Visualization",
                },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Decision Making" },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Change Management" },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Risk Analysis" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Business Intelligence",
                },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Systems Analysis" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Elicitation Techniques",
                },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Gap Analysis" },
                { courseId: "clycxiomd00005a7ifv6t8r5o", content: "Workflow Analysis" },
                {
                    courseId: "clycxiomd00005a7ifv6t8r5o",
                    content: "Real-World Projects",
                },
            ],
        });
        console.log("Success");
    }
    catch (error) {
        console.log("Error seeding the course tags", error);
    }
    finally {
        await database.$disconnect();
    }
}
main();
//# sourceMappingURL=tags.js.map