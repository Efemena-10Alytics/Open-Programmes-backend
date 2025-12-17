"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
    try {
        await database.skillsYouWillLearn.createMany({
            data: [
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/6f47371e-00d1-4a67-a987-5965f1a9d757-1uj5gi.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/d528bb06-2962-4b40-be73-284d25052c7d-xamgr8.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/e7a46873-d31b-4176-bbe2-4026687220bf-14kgnh.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/a973bf0f-793e-44eb-ac53-169de8a05ade-e74ksi.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/eabf0590-9ee3-4507-a548-f52c19ad0f1e-c81yg1.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/aa41e589-0bfe-483b-92dc-bdd6fc064237-bv3uzi.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/246c059e-a184-4363-9c3d-7facbbc50416-3xgdov.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/adcb7683-d772-4924-b6b9-0d2c13250983-1dhou.png" },
                { courseId: "clycxjlec00015a7iycm2cbdn", iconUrl: "https://utfs.io/f/fde56670-1294-4368-bc68-a20cd7d81fb5-1rji.png" },
            ],
        });
        console.log("Success");
    }
    catch (error) {
        console.log("Error seeding the course skills", error);
    }
    finally {
        await database.$disconnect();
    }
}
main();
//# sourceMappingURL=skills.js.map