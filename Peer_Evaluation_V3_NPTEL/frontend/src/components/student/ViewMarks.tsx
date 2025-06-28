import { useEffect, useState } from "react";
import axios from "axios";

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

interface Batch {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  name: string;
  batches: Batch[];
}

interface Evaluator {
  _id: string;
  name: string;
}

interface ExamResult {
  exam: {
    _id: string;
    title: string;
    startTime: string;
    courseName: string;
    batchId?: string;
    batchName?: string;
  };
  averageMarks: string | null;
  marks: number[][];
  feedback: string[];
  evaluators: Evaluator[];
}

const ViewMarks = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [raiseTicketMap, setRaiseTicketMap] = useState<{ [key: string]: boolean }>({});
  const [ticketMessages, setTicketMessages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [coursesRes, resultsRes] = await Promise.all([
          axios.get(`http://localhost:${PORT}/api/student/enrolled-courses-batches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:${PORT}/api/student/results`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesRes.data.courses || []);
        setAllResults(resultsRes.data.results || []);
        setFilteredResults(resultsRes.data.results || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCourse && !selectedBatch) {
      setFilteredResults(allResults);
      return;
    }

    const courseName = courses.find(c => c._id === selectedCourse)?.name;
    const results = allResults.filter(r => {
      const matchCourse = courseName ? r.exam.courseName === courseName : true;
      const matchBatch = selectedBatch ? r.exam.batchId === selectedBatch : true;
      return matchCourse && matchBatch;
    });

    setFilteredResults(results);
  }, [selectedCourse, selectedBatch, allResults, courses]);

  const toggleRaiseTicket = (key: string) => {
    setRaiseTicketMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTicketChange = (key: string, message: string) => {
    setTicketMessages(prev => ({ ...prev, [key]: message }));
  };

  const submitTicket = async (examId: string, evaluatorId: string, key: string) => {
    const message = ticketMessages[key];
    if (!message.trim()) return alert("Please enter a concern message.");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:${PORT}/api/student/raise-ticket`,
        {
          examId,
          evaluatorId,
          message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Ticket submitted successfully.");
      toggleRaiseTicket(key);
    } catch (err) {
      console.error("Failed to raise ticket", err);
      alert("Ticket submission failed.");
    }
  };

  return (
    <div className="p-10 w-full max-w-5xl space-y-8">
      <h2 className="text-3xl font-bold text-[#38365e] mb-4">Your Marks</h2>

      <div className="flex gap-4">
        <select
          className="border px-4 py-2 rounded-xl"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedBatch("");
          }}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border px-4 py-2 rounded-xl"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          disabled={!selectedCourse}
        >
          <option value="">All Batches</option>
          {courses.find((c) => c._id === selectedCourse)?.batches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredResults.length === 0 ? (
        <div>No results to display</div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((res) => (
            <div key={res.exam._id} className="bg-white rounded-xl p-6 shadow border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-semibold">{res.exam.title}</div>
                  <div className="text-sm text-gray-600">
                    Course: {res.exam.courseName} | Batch: {res.exam.batchName}
                  </div>
                  <div className="text-sm text-gray-700">Average Marks: {res.averageMarks}</div>
                </div>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
                  onClick={() =>
                    setDetailsOpen(detailsOpen === res.exam._id ? null : res.exam._id)
                  }
                >
                  {detailsOpen === res.exam._id ? "Hide Details" : "View Details"}
                </button>
              </div>

              {detailsOpen === res.exam._id && (
                <div className="mt-4 space-y-4">
                  {res.marks.map((markSet, idx) => {
                    const evaluator = res.evaluators?.[idx];
                    const key = `${res.exam._id}-${idx}`;
                    return (
                      <div key={idx} className="border rounded-xl px-4 py-3 bg-gray-50">
                        <div className="font-medium">Evaluator: {evaluator?.name || `Peer ${idx + 1}`}</div>
                        <div className="text-sm">Marks: {markSet.join(", ")}</div>
                        <div className="text-sm">Feedback: {res.feedback[idx] || "No feedback"}</div>

                        <button
                          className="text-blue-600 underline mt-1 text-sm"
                          onClick={() => toggleRaiseTicket(key)}
                        >
                          {raiseTicketMap[key] ? "Cancel" : "Raise Ticket"}
                        </button>

                        {raiseTicketMap[key] && (
                          <div className="mt-2">
                            <textarea
                              placeholder="Describe your concern..."
                              className="w-full border rounded-xl px-3 py-2 text-sm"
                              value={ticketMessages[key] || ""}
                              onChange={e => handleTicketChange(key, e.target.value)}
                            />
                            <button
                              onClick={() => {
                                if (evaluator?._id)
                                  submitTicket(res.exam._id, evaluator._id, key);
                              }}
                              className="bg-red-600 text-white mt-2 px-4 py-1 rounded-xl text-sm"
                            >
                              Submit Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewMarks;
