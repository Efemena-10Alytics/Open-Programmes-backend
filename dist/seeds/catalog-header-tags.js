"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
    try {
        await database.catalogHeaderTags.createMany({
            data: [
                { courseId: "clycxjxdz00025a7isah5z5yb", title: "14 weeks", imageUrl: "https://utfs.io/f/34d9fda5-7ce6-448e-b1bd-2df7baedfd43-154jtr.png" },
                { courseId: "clycxjxdz00025a7isah5z5yb", title: "26 Modules", imageUrl: "https://utfs.io/f/ab9ce919-10a1-4d9e-b55f-e88f262ae295-spvnod.png" },
                { courseId: "clycxjxdz00025a7isah5z5yb", title: "161 Lessons", imageUrl: "https://utfs.io/f/34d9fda5-7ce6-448e-b1bd-2df7baedfd43-154jtr.png" },
                { courseId: "clycxjxdz00025a7isah5z5yb", title: "9 Assignments", imageUrl: "https://utfs.io/f/34d9fda5-7ce6-448e-b1bd-2df7baedfd43-154jtr.png" },
                { courseId: "clycxjxdz00025a7isah5z5yb", title: "13 Projects", imageUrl: "https://utfs.io/f/71c17f06-e74f-43f0-9c70-5ec6e7f8e97a-x8vfgj.png" },
                { courseId: "clycxjxdz00025a7isah5z5yb", title: "13 Live Classes", imageUrl: "https://utfs.io/f/c197eacd-1755-4df6-b77c-7b169533190a-x8vfhe.png" },
            ],
        });
        console.log("Success");
    }
    catch (error) {
        console.log("Error seeding the course catalog header tags", error);
    }
    finally {
        await database.$disconnect();
    }
}
main();
//# sourceMappingURL=catalog-header-tags.js.map