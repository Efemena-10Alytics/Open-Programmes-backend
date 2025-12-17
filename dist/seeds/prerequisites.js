"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
    try {
        await database.prerequisite.createMany({
            data: [
                {
                    courseId: "clycxjxdz00025a7isah5z5yb",
                    content: "There are no prerequisites for this program. ",
                },
                {
                    courseId: "clycxjxdz00025a7isah5z5yb",
                    content: "Learners should be comfortable opening files, folders, and applications",
                },
                {
                    courseId: "clycxjxdz00025a7isah5z5yb",
                    content: "Learners should be able to perform simple operations like copy/paste.",
                },
                {
                    courseId: "clycxjxdz00025a7isah5z5yb",
                    content: " Learners need access to a computer running OS X or Windows",
                },
            ],
        });
        console.log("Success");
    }
    catch (error) {
        console.log("Error seeding the course prrerequisites", error);
    }
    finally {
        await database.$disconnect();
    }
}
main();
//# sourceMappingURL=prerequisites.js.map