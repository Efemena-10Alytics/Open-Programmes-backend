import { prismadb } from "../index";

export const incrementPoints = async (
  userId: string,
  quizId: string,
  isCorrect: boolean
) => {
  if (isCorrect) {
    const leaderboardEntry = await prismadb.leaderboard.upsert({
      where: {
        userId_quizId: {
          userId: userId,
          quizId: quizId,
        },
      },
      update: {
        points: {
          increment: 10,
        },
      },
      create: {
        userId: userId,
        quizId: quizId,
        points: 10,
      },
    });

    console.log(
      `Points updated for user ${userId} in quiz ${quizId}:`,
      leaderboardEntry.points
    );
  }
};
