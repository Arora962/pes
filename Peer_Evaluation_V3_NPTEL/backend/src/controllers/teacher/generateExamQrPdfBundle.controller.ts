import { Request, Response } from "express";
import { Exam } from "../../models/Exam.ts";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts";
import { Course } from "../../models/Course.ts";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import archiver from "archiver";
import { Types } from "mongoose";
import stream from "stream";

export const generateQrPdfBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .populate("course", "name")
      .populate("batch", "name");
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    const batch = await Batch.findById(exam.batch).populate("students", "name email");
    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${exam.title.replace(/\s+/g, "_")}_QR_Papers.zip"`
    );

    archive.pipe(res);

    for (const student of batch.students as any[]) {
      const studentId = (student._id as Types.ObjectId).toString();
      const qrData = JSON.stringify({ studentId, examId });

      const qrBuffer = await QRCode.toBuffer(qrData);

      const pdfStream = new stream.PassThrough();
      const doc = new PDFDocument({ autoFirstPage: false });

      doc.pipe(pdfStream);

      doc.addPage({ size: "A4", margin: 50 });
      doc.image(qrBuffer, 50, 40, { width: 100 });

      doc.moveDown();
      doc.fontSize(20).text(`Exam: ${exam.title}`, { align: "center" });
      doc.moveDown();
        const courseName = (exam.course as unknown as { name: string }).name;
        doc.fontSize(16).text(`Course: ${courseName}`, { align: "center" });

      doc.end();

      const chunks: any[] = [];
      pdfStream.on("data", (chunk) => chunks.push(chunk));
      await new Promise<void>((resolve) =>
        pdfStream.on("end", () => {
          const finalBuffer = Buffer.concat(chunks);
          const filename = `${student.name}_${student._id}_${exam.title.replace(
            /\s+/g,
            "_"
          )}.pdf`;
          archive.append(finalBuffer, { name: filename });
          resolve();
        })
      );
    }

    await archive.finalize();
  } catch (err) {
    console.error("QR PDF bundle error:", err);
    res.status(500).json({ message: "Failed to generate PDF bundle" });
  }
};
