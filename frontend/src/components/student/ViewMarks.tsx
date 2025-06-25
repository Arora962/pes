// frontend/src/components/student/ViewMarks.tsx

import { useEffect, useState } from 'react';
import axios from 'axios'; // Use axios for consistency

interface ExamInfo {
    _id: string;
    title: string;
    startTime?: string;
    courseName?: string;
}

interface Result {
    exam: ExamInfo;
    averageMarks: string | null;
    marks: number[][]; // Assuming marks can be nested arrays or single numbers
    feedback: string[];
}

const ViewMarks = () => {
    const [marks, setMarks] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated');
                setLoading(false);
                return;
            }
            try {
                // IMPORTANT: Remember to change this to `/api/...` after setting up Vite proxy
                const res = await axios.get('http://localhost:5000/api/student/results', { // Using axios
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMarks(res.data.results || []);
            } catch (err: any) {
                setError(
                    err.response?.data?.message || err.message || 'Failed to fetch marks' // Improved error handling with axios
                );
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, []);

    // --- Tailwind Classes & Inline Styles Definitions ---
    // Defined gradients and shadows for reusability without external CSS
    const mainBackgroundGradient = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    const cardShadow = '0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
    const cardBeforeGradient = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
    const headerGradient = 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
    const resultItemBgGradient = 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)';
    const resultItemShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    const resultItemHoverShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
    const marksBadgeGradient = 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)';
    const marksBadgeShadow = '0 2px 8px rgba(45, 55, 72, 0.3)';
    const averageScoreGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const averageScoreShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';


    // Common Tailwind classes for a card-like container
    const commonCardContainerClasses = `
      bg-white rounded-[20px] p-10 border border-black/10 relative overflow-hidden
      shadow-[${cardShadow}] sm:p-5
    `;

    // Classes for list items / result items
    const commonResultItemClasses = `
        rounded-2xl p-8 border border-black/10 relative overflow-hidden
        transition-all duration-300 ease-in-out
        shadow-[${resultItemShadow}] sm:p-5
    `;


    if (loading) return (
        <div className="max-w-[900px] mx-auto min-h-screen py-10 px-5 font-sans" style={{ background: mainBackgroundGradient }}>
            <div className={commonCardContainerClasses}>
                {/* Card Before Element */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: cardBeforeGradient }}></div>
                <p className="text-center text-gray-600 text-lg py-10 font-medium">Loading marks...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-[900px] mx-auto min-h-screen py-10 px-5 font-sans" style={{ background: mainBackgroundGradient }}>
            <div className={commonCardContainerClasses}>
                {/* Card Before Element */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: cardBeforeGradient }}></div>
                <p className="text-center text-red-600 text-lg py-10 font-medium bg-red-50/5 rounded-xl border border-red-500/20">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[900px] mx-auto min-h-screen py-10 px-5 font-sans" style={{ background: mainBackgroundGradient }}>
            <div className={commonCardContainerClasses}>
                {/* Card Before Element */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: cardBeforeGradient }}></div>
                <h2
                    className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent tracking-[-1px]"
                    style={{ background: headerGradient }}
                >
                    My Academic Results
                </h2>
                {marks.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10 font-medium">No examination results available at the moment.</p>
                ) : (
                    <ul className="list-none p-0 m-0 flex flex-col gap-6">
                        {marks.map((result, idx) => (
                            <li
                                key={idx}
                                className={commonResultItemClasses}
                                style={{ background: resultItemBgGradient }}
                                onMouseEnter={(e) => {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.transform = 'translateY(-2px)';
                                    target.style.boxShadow = resultItemHoverShadow;
                                }}
                                onMouseLeave={(e) => {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.transform = 'translateY(0)';
                                    target.style.boxShadow = resultItemShadow;
                                }}
                            >
                                <div className="flex flex-wrap items-center mb-4 text-base">
                                    <span className="font-bold text-gray-900 mr-2 min-w-[120px]">Course:</span>
                                    <span className="text-gray-700 flex-1">{result.exam?.courseName || 'Course'}</span>
                                </div>

                                <div className="flex flex-wrap items-center mb-4 text-base">
                                    <span className="font-bold text-gray-900 mr-2 min-w-[120px]">Examination:</span>
                                    <span className="text-gray-700 flex-1">
                                        {result.exam?.title || 'Exam'}
                                        {result.exam?.startTime && (
                                            <span className="ml-3 text-gray-600 text-sm italic">
                                                ({new Date(result.exam.startTime).toLocaleDateString()})
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center mb-4 text-base">
                                    <span className="font-bold text-gray-900 mr-2 min-w-[120px]">Average Score:</span>
                                    <span
                                        className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white"
                                        style={{ background: averageScoreGradient, boxShadow: averageScoreShadow }}
                                    >
                                        {result.averageMarks || 'N/A'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center mb-4 text-base">
                                    <span className="font-bold text-gray-900 mr-2 min-w-[120px]">Detailed Marks:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Array.isArray(result.marks) && result.marks.length > 0
                                            ? result.marks.map((m, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                                                    style={{ background: marksBadgeGradient, boxShadow: marksBadgeShadow }}
                                                >
                                                    {Array.isArray(m) ? m.join(", ") : m}
                                                </span>
                                            ))
                                            : <span
                                                className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                                                style={{ background: marksBadgeGradient, boxShadow: marksBadgeShadow }}
                                              >
                                                N/A
                                              </span>
                                        }
                                    </div>
                                </div>

                                {(result.feedback && result.feedback.length > 0) && (
                                    <div className="flex flex-wrap items-start text-base"> {/* Use items-start for multiline feedback */}
                                        <span className="font-bold text-gray-900 mr-2 min-w-[120px] mt-1">Feedback:</span>
                                        <div
                                            className="flex-1 p-4 text-base leading-relaxed italic text-gray-700 rounded-xl border border-indigo-500/20 bg-indigo-500/5"
                                        >
                                            {Array.isArray(result.feedback)
                                                ? result.feedback.join(" • ")
                                                : result.feedback}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ViewMarks;