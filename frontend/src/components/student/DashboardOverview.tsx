// frontend/src/components/student/DashboardOverview.tsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const DashboardOverview = () => {
  const token = localStorage.getItem('token');

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['upcomingExams'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/student/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.exams || [];
    },
  });

  const { data: evaluations = [], isLoading: evalsLoading } = useQuery({
    queryKey: ['pendingEvaluations'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/student/pending-evaluations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.evaluations || data?.evaluatees || [];
    },
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['evaluationResults'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/student/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.results || [];
    },
  });

  // Reusable Tailwind gradients and shadows for cards
  const cardShadow = `0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.08)`;
  const cardHoverShadow = `0 10px 20px rgba(0, 0, 0, 0.1), 0 20px 40px rgba(0, 0, 0, 0.12)`;
  const cardBeforeGradient = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';

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

  return (
    <div className="grid grid-cols-fill-minmax-300 gap-8 relative z-10 sm:grid-cols-1 sm:gap-5">
      {/* Upcoming Exams */}
      <div className={commonCardClasses}>
        <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
        <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900">Upcoming Exams</h3>
        {examsLoading ? (
          <p className="text-gray-700 text-base">Loading...</p>
        ) : exams.length === 0 ? (
          <p className="text-gray-700 text-base">No upcoming exams</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-base leading-relaxed">
            {exams.slice(0, 3).map((exam: any) => ( // Cast to any to access properties like _id, title, startTime
              <li key={exam._id}>
                {exam.title} - {new Date(exam.startTime).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending Evaluations */}
      <div className={commonCardClasses}>
        <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
        <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900">Peer Evaluations</h3>
        {evalsLoading ? (
          <p className="text-gray-700 text-base">Loading...</p>
        ) : (
          <p className="text-gray-700 text-base">You have {evaluations.length} peer reviews pending.</p>
        )}
      </div>

      {/* Recent Grades */}
      <div className={commonCardClasses}>
        <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
        <h3 className="mb-4 text-xl font-bold tracking-tight text-gray-900">Recent Grades</h3>
        {resultsLoading ? (
          <p className="text-gray-700 text-base">Loading...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-700 text-base">No evaluation results available.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-base leading-relaxed">
            {results.slice(0, 3).map((r: any) => (
              <li key={r.exam._id}>
                {r.exam.courseName}: <span className="font-semibold text-gray-900">{r.averageMarks}/100</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;