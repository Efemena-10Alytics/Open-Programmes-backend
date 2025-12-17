const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    await database.learningOutcome.createMany({
      data: [
{ courseId: "clycxjlec00015a7iycm2cbdn", content: "Understand and apply data collection techniques to gather accurate information from various sources." },
{ courseId: "clycxjlec00015a7iycm2cbdn", content: "Analyze and interpret complex datasets using advanced Excel functions and SQL queries." },
{ courseId: "clycxjlec00015a7iycm2cbdn", content: "Create dynamic reports and dashboards using Power BI and Tableau for insightful data visualization." },
{ courseId: "clycxjlec00015a7iycm2cbdn", content: "Integrate ChatGPT for Analytics into data workflows to enhance analytical processes and outputs." },
{ courseId: "clycxjlec00015a7iycm2cbdn", content: "Model and solve business problems by applying data-driven decision-making techniques in real-world scenarios." },
{ courseId: "clycxjlec00015a7iycm2cbdn", content: "Transition from a beginner to a master data analyst, capable of handling complex analytical tasks in any industry setting." },
      ],
    });

    console.log("Success");
  } catch (error) {
    console.log("Error seeding the course learning outcome", error);
  } finally {
    await database.$disconnect();
  }
}

main();
