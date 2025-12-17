"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
    try {
        await database.course.update({
            data: {
                catalog_header_image: "https://utfs.io/f/f68af66e-c510-46ba-b2fd-d46a59696470-2bu2gr.png",
            },
            where: {
                id: "clycxjxdz00025a7isah5z5yb",
            },
        });
        console.log("Success");
    }
    catch (error) {
        console.log("Error seeding the course catalog header image", error);
    }
    finally {
        await database.$disconnect();
    }
}
main();
//# sourceMappingURL=catalog-header-image.js.map