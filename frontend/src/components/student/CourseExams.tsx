// frontend/src/components/student/CourseExams.tsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useRef } from 'react';

type Exam = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  batch: { name: string };
  questions: {
    questionText: string;
    maxMarks: number;
  }[];
};

type Props = {
  courseId: string;
  onBack: () => void;
};

const fetchExams = async (courseId: string): Promise<Exam[]> => {
  const { data } = await axios.get(
    `http://localhost:5000/api/student/courses/${courseId}/exams`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  );
  return data.exams;
};

const CourseExams = ({ courseId, onBack }: Props) => {
  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['courseExams', courseId],
    queryFn: () => fetchExams(courseId),
  });

  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [viewingQuestions, setViewingQuestions] = useState<Exam | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (examId: string) => {
    setActiveExamId(examId);
    setUploadMsg(null);
    setSelectedFile(null);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (examId: string) => {
    if (!selectedFile) {
      setUploadMsg('Please select a PDF file.');
      return;
    }
    setUploadMsg('Uploading...');
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('examId', examId);
      await axios.post(
        'http://localhost:5000/api/student/submit-answer',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploadMsg('Submission successful!');
      setActiveExamId(null);
      setSelectedFile(null);
    } catch (err: any) {
      setUploadMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Submission failed.'
      );
    }
  };

  // Reusable Tailwind gradients and shadows
  const cardShadow = `0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.08)`;
  const cardHoverShadow = `0 10px 20px rgba(0, 0, 0, 0.1), 0 20px 40px rgba(0, 0, 0, 0.12)`;
  const cardBeforeGradient = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
  const buttonBg = 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)';
  const buttonHoverBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const buttonShadow = '0 4px 12px rgba(45, 55, 72, 0.3)';
  const buttonHoverShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';

  // Common Tailwind classes for a card
  const commonCardClasses = `
    bg-white rounded-2xl p-8 border border-black/10 shadow-[${cardShadow}]
    transition-all duration-300 ease-in-out relative overflow-hidden
    hover:translate-y-[-6px] hover:shadow-[${cardHoverShadow}] hover:border-[rgba(102,126,234,0.2)]
    sm:p-5
  `;
  const commonCardBeforeClasses = `
    content-[''] absolute top-0 left-0 right-0 h-1
    origin-left scale-x-0 transition-transform duration-300 ease-in
  `;
  const commonButtonClasses = `
    group relative overflow-hidden text-white border-none py-3 px-6 rounded-xl font-semibold
    cursor-pointer text-base transition-all duration-300 ease-in-out
    shadow-[${buttonShadow}]
    hover:translate-y-[-2px] hover:shadow-[${buttonHoverShadow}]
    active:translate-y-0
  `;
  const commonButtonBeforeClasses = `
    content-[''] absolute top-0 left-[-100%] w-full h-full
    bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500
    group-hover:left-full
  `;
  const modalOverlayBg = 'rgba(0,0,0,0.5)';
  const modalContentBg = 'white';


  if (isLoading) return <div className="text-center p-4 text-gray-700">Loading exams...</div>;
  if (error) return <div className="text-center p-4 text-red-600">Failed to load exams.</div>;

  const now = new Date();

  return (
    <div className="grid grid-cols-fill-minmax-300 gap-8 relative z-10 sm:grid-cols-1 sm:gap-5">
      <button
        className={`${commonButtonClasses} mb-4 w-fit`} // Added w-fit to prevent full width
        onClick={onBack}
        style={{ background: buttonBg }}
      >
        <span className={commonButtonBeforeClasses}></span>
        ← Back to Courses
      </button>

      {exams.map((exam) => {
        const isStarted = new Date(exam.startTime) <= now;
        const isEnded = new Date(exam.endTime) < now;
        const canSubmit = isStarted && !isEnded;

        return (
          <div key={exam._id} className={commonCardClasses}>
            <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
            <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900">{exam.title}</h3>
            <p className="text-gray-700 text-base leading-relaxed mb-1">Batch: {exam.batch?.name}</p>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {new Date(exam.startTime).toLocaleString()} →{' '}
              {new Date(exam.endTime).toLocaleString()}
            </p>

            <button
              className={`${commonButtonClasses} mt-2`}
              onClick={() => setViewingQuestions(exam)}
              disabled={!isStarted}
              style={{ background: buttonBg }}
            >
              <span className={commonButtonBeforeClasses}></span>
              {isStarted ? 'View Questions' : 'Locked'}
            </button>


            <button
              className={`${commonButtonClasses} mt-2`}
              disabled={!canSubmit}
              onClick={() => handleButtonClick(exam._id)}
              style={{ background: buttonBg }}
            >
              <span className={commonButtonBeforeClasses}></span>
              {isEnded ? 'Closed' : isStarted ? 'Submit Answers' : 'Not Started'}
            </button>

            {activeExamId === exam._id && canSubmit && (
              <div className="mt-4 flex flex-col gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  className={`${commonButtonClasses}`}
                  onClick={() => handleSubmit(exam._id)}
                  style={{ background: buttonBg }}
                >
                  <span className={commonButtonBeforeClasses}></span>
                  {selectedFile ? 'Upload PDF' : 'Choose PDF'}
                </button>
                {selectedFile && (
                  <span className="ml-2 text-sm text-gray-600">{selectedFile.name}</span>
                )}
                {uploadMsg && (
                  <div className="mt-2 text-sm text-gray-700">{uploadMsg}</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 🧠 Question Modal */}
      {viewingQuestions && (
        <div
          className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[1000]"
          style={{ backgroundColor: modalOverlayBg }}
          onClick={() => setViewingQuestions(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[90%] max-w-[600px] max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: modalContentBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">{viewingQuestions.title} - Questions</h2>
            <ol className="mt-3 list-decimal list-inside space-y-2 text-gray-700">
              {viewingQuestions.questions.map((q, idx) => (
                <li key={idx} className="mb-2">
                  {q.questionText} <em className="text-gray-500">({q.maxMarks} marks)</em>
                </li>
              ))}
            </ol>
            <button
              className={`${commonButtonClasses} mt-4`}
              onClick={() => setViewingQuestions(null)}
              style={{ background: buttonBg }}
            >
              <span className={commonButtonBeforeClasses}></span>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseExams;