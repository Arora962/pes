// frontend/src/components/student/PeerEvaluationsPending.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface Evaluation {
    _id: string;
    exam: {
        title: string;
    };
    evaluatee: {
        name: string;
        email: string;
    };
}

const PeerEvaluationsPending = () => {
    const [pending, setPending] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/student/pending-evaluations", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res.data);
                setPending(res.data.evaluations || []);
            } catch (err: any) {
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Failed to fetch pending evaluations"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

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

    if (loading) return (
        <div className={commonCardClasses}>
            <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
            <p className="text-gray-700 text-base">Loading pending evaluations...</p>
        </div>
    );
    if (error) return (
        <div className={`${commonCardClasses} text-red-500`}>
            <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
            <p className="text-red-600 text-base">{error}</p>
        </div>
    );

    return (
        <div className={commonCardClasses}>
            <div className={commonCardBeforeClasses} style={{ background: cardBeforeGradient }}></div>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900">Pending Peer Evaluations</h2>
            {pending.length === 0 ? (
                <p className="text-gray-700 text-base">No pending evaluations</p>
            ) : (
                <ul className="list-disc pl-5 space-y-3 text-gray-700 text-base leading-relaxed">
                    {pending.map((ev) => (
                        <li key={ev._id}>
                            <strong className="font-semibold text-gray-900">Exam:</strong> {ev.exam.title}
                            <br />
                            <span className="text-sm italic text-gray-500">For: {ev.evaluatee.name} ({ev.evaluatee.email})</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PeerEvaluationsPending;