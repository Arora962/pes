import cron from "node-cron";
import { Evaluation } from "../models/Evaluation.ts";
import { User } from "../models/User.ts";
import { sendReminderEmail } from "../utils/email.ts";

cron.schedule("12 18 * * *", async () => {
  try {
    console.log("Running evaluation reminder job...");
    const pendingEvaluations = await Evaluation.find({
      status: "pending",
    }).populate({
      path: "exam",
      select: "title course",
      populate: { path: "course", select: "name" },
    });

    const reminders: Record<
      string,
      Record<string, { examTitle: string; courseName: string; count: number }>
    > = {};

    for (const ev of pendingEvaluations) {
      const evaluatorId = ev.evaluator?.toString?.() ?? String(ev.evaluator);
      const examObj = ev.exam as any;
      const examId = examObj?._id?.toString?.() ?? String(examObj?._id);
      const examTitle = examObj?.title ?? "Unknown Exam";
      const courseObj = examObj?.course as any;
      const courseName = courseObj?.name ?? "Unknown Course";

      if (!reminders[evaluatorId]) reminders[evaluatorId] = {};
      if (!reminders[evaluatorId][examId]) {
        reminders[evaluatorId][examId] = { examTitle, courseName, count: 0 };
      }
      reminders[evaluatorId][examId].count += 1;
    }

    const users = await User.find({ _id: { $in: Object.keys(reminders) } });

    for (const user of users) {
      const userId = (
        user._id as unknown as { toString: () => string }
      ).toString();
      const examsInfo = reminders[userId];
      const examList = Object.values(examsInfo)
        .map(
          ({ examTitle, courseName, count }) =>
            `- ${examTitle} (${courseName}): ${count} pending evaluation(s)`
        )
        .join("\n");

      const message = `Dear ${user.name},

You have pending peer evaluations for the following exams:

${examList}
Please complete them as soon as possible.

Thank you!`;
      console.log(`Sending reminder to ${user.email}`);
      await sendReminderEmail(user.email, "Peer Evaluation Reminder", message);
    }
  } catch (error) {
    console.error("Error sending evaluation reminders:", error);
  }
});