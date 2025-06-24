import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import {
  FiMenu, FiLogOut, FiHome,
  FiBook, FiUsers, FiEdit, FiShield,
  FiDownload, FiUserPlus, FiUserCheck
} from 'react-icons/fi';

// Optional: If you want animated numbers and motion, install framer-motion
import { motion } from 'framer-motion';

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

interface ExamRecord {
  title: string;
  course: string;
  batch: string;
  startTime: string;
  endTime: string;
  numQuestions: number;
  duration: string;
  totalMarks: number;
  k: number;
  totalStudents: number;
  solutions: string;
}

type CourseBatchItem = {
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
};

const AnimatedCount = ({ value }: { value: number }) => {
  const [display, setDisplay] = React.useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let increment = end > start ? 1 : -1;
    let stepTime = 20;
    const timer = setInterval(() => {
      start += increment;
      setDisplay(start);
      if (start === end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
};

const TeacherDashboard = ({ onLogout }: { onLogout?: () => void }) => {
  const token = localStorage.getItem('token');

  const [counts, setCounts] = useState({ courses: 0, batches: 0, exams: 0 });
  const [courseBatchList, setCourseBatchList] = useState<CourseBatchItem[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({ name: "", email: "", role: "" });

  const [activePage, setActivePage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showExamMsg, setShowExamMsg] = useState(false);
  const [showRoleMsg, setShowRoleMsg] = useState(false);
  const [showProfileMsg] = useState(false);
  const [allUsers, setAllUsers] = useState<{ role: string; email: string; name: string }[]>([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [roleEmail, setRoleEmail] = useState("");
  const [roleType, setRoleType] = useState("Student");
  const [logoutDialog, setLogoutDialog] = useState(false);

  const [examTitle, setExamTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numQuestions, setNumQuestions] = useState(0);
  const [k, setK] = useState(0);
  const [solutions, setSolutions] = useState<File | null>(null);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollBatch, setEnrollBatch] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState<Record<string, {name: string, email: string}[]>>({});
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/dashboard/counts`)
      .then(res => res.json())
      .then(data => {
        setCounts({
          courses: data.courses,
          batches: data.batches,
          exams: data.exams,
        });
      })
      .catch(err => console.error('Failed to fetch dashboard counts:', err));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/dashboard/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data: { name: string, email: string, role: string }) => {
        setProfileData(data);
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
      });
  }, []);

  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/teacher/teacher-courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCourseBatchList(data);
      })
      .catch((err) => {
        console.error('Failed to fetch teacher courses:', err);
      });
  }, []);

  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/teacher/teacher-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCourses(data.map((d: any) => ({ id: d.courseId, name: d.courseName })));
        setBatches(data.map((d: any) => ({ id: d.batchId, name: d.batchName })));
      });
  }, []);

  const fetchExamRecords = () => {
    fetch(`http://localhost:${PORT}/api/teacher/exams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setExamRecords(data));
  };

  useEffect(() => {
    fetchExamRecords();
  }, []);

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "0 mins";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} mins`;
  };

  const handleExamSchedule = () => {
    fetch(`http://localhost:${PORT}/api/teacher/schedule-exam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId: selectedCourse,
        batchId: selectedBatch,
        title: examTitle,
        startTime,
        endTime,
        numQuestions,
        k,
        solutions: solutions?.name || "",
        duration: calculateDuration(startTime, endTime),
        totalMarks: numQuestions * 10,
        totalStudents: 0
      }),
    })
      .then(res => res.json())
      .then(() => {
        setSelectedCourse('');
        setSelectedBatch('');
        setExamTitle('');
        setStartTime('');
        setEndTime('');
        setNumQuestions(0);
        setK(0);
        setSolutions(null);
        setShowExamMsg(true);
        setTimeout(() => setShowExamMsg(false), 1200);
        fetchExamRecords();
      });
  };

  const handleEnrollStudent = (course: string, batch: string) => {
    setEnrollCourse(course);
    setEnrollBatch(batch);
    setShowEnrollModal(true);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = `${enrollCourse}_${enrollBatch}`;
    const manual = studentName.trim() && studentEmail.trim();
    const csvStudents = (enrolledStudents[key]?.length || 0) > 0;

    if (!manual && !csvStudents) {
     setEnrollError("Please upload a CSV file.");
      return;
    }

    if (manual) {
      setEnrolledStudents(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { name: studentName, email: studentEmail }]
      }));
    }

    setEnrollSuccess(true);
    setTimeout(() => {
      setShowEnrollModal(false);
      setEnrollSuccess(false);
      setStudentName("");
      setStudentEmail("");
    }, 1000);
  };

  const downloadCSV = (course: string, batch: string) => {
    const key = `${course}_${batch}`;
    const students = enrolledStudents[key] || [];
    let csv = "Name,Email,Course,Batch\n";
    students.forEach(s => {
      csv += `"${s.name}","${s.email}","${course}","${batch}"\n`;
    });
    if (students.length === 0) {
      csv += "No students enrolled,,,\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course}_${batch}_students.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchAllUsers = () => {
    fetch(`http://localhost:${PORT}/api/teacher/users`)
      .then(res => res.json())
      .then(data => {
        setAllUsers(data);
      })
      .catch(err => console.error('Failed to fetch users:', err));
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleRoleUpdate = () => {
    fetch(`http://localhost:${PORT}/api/teacher/update-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email: roleEmail, role: roleType })
    })
      .then(() => {
        setShowRoleMsg(true);
        setTimeout(() => setShowRoleMsg(false), 1200);
        fetchAllUsers();
        setRoleEmail('');
        setRoleType('student');
      });
  };

  const ProfileSVG = () => (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="19" fill="#57418d" />
      <circle cx="19" cy="14" r="7" fill="#fff" />
      <ellipse cx="19" cy="29.5" rx="11" ry="7.5" fill="#fff" />
    </svg>
  );

  const DialogBox = ({
    show,
    message,
    children
  }: { show: boolean, message: string, children?: React.ReactNode }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center min-w-[320px] relative animate-fadein">
          <div className="mb-2">
            <svg width={56} height={56} fill="none" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="28" fill="#6ddf99" />
              <path d="M18 30l7 7 13-13" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-lg text-[#235d3a] font-semibold text-center mb-1">{message}</div>
          {children}
        </div>
      </div>
    );
  };

  // --- Home page: NEW INTERACTIVE UI ---
  const pages: Record<string, JSX.Element> = {
    home: (
     <motion.div
  className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4 animate-fadein"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>
 <h1 className="text-4xl font-extrabold mb-4 text-[#38365e] text-center drop-shadow">
  Welcome, Teacher!
</h1>
<p className="text-gray-700 text-base whitespace-nowrap">
  Make teaching easier – manage your courses, batches, and exams from one place.
</p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mt-10 w-full max-w-5xl">

    {[
      {
        icon: FiBook,
        label: 'Courses',
        count: counts.courses,
        gradient: 'from-blue-400 via-blue-600 to-cyan-500', // Blue gradient
        shadow: 'shadow-blue-300/50',
        page: 'courses'
      },
      {
        icon: FiUsers,
        label: 'Batches',
        count: counts.batches,
        gradient: 'from-green-400 via-green-600 to-emerald-400', // Green gradient
        shadow: 'shadow-green-300/50',
        page: 'courses'
      },
      {
        icon: FiEdit,
        label: 'Exams',
        count: counts.exams,
        gradient: 'from-pink-500 via-red-500 to-orange-500', // Red gradient
        shadow: 'shadow-red-300/50',
        page: 'exams'
      },
    ].map((c) => (
      <motion.div
        key={c.label}
        className={`
          bg-gradient-to-br ${c.gradient} ${c.shadow}
          p-8 rounded-3xl text-white flex flex-col justify-center items-center h-48 transition 
          hover:scale-105 hover:shadow-2xl cursor-pointer relative group
        `}
        whileHover={{ y: -8, scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        onClick={() => setActivePage(c.page)}
      >
        <span className="absolute top-4 right-4 bg-white/20 rounded-full p-1 group-hover:bg-white/40 transition">
          <c.icon className="text-4xl drop-shadow-lg" />
        </span>
        <h3 className="text-xl font-bold mt-6 mb-1">{c.label}</h3>
        <p className="text-5xl font-extrabold tracking-wider drop-shadow-lg">
          <AnimatedCount value={c.count} />
        </p>
      </motion.div>
    ))}
  </div>
  <div className="mt-12 flex flex-col md:flex-row justify-center gap-8 w-full max-w-2xl">
    <motion.button
      onClick={() => setActivePage('courses')}
      className="flex items-center gap-2 bg-gradient-to-r from-[#57418d] to-[#7b2ff2] hover:from-[#7b2ff2] hover:to-[#57418d] text-white px-12 py-4 text-lg rounded-full font-semibold shadow-lg hover:scale-105 transition"
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.96 }}
    >
      <FiBook className="text-2xl" />
      Manage Courses
    </motion.button>
    <motion.button
      onClick={() => setActivePage('exams')}
      className="flex items-center gap-2 bg-gradient-to-r from-[#ff512f] to-[#dd2476] hover:from-[#dd2476] hover:to-[#ff512f] text-white px-12 py-4 text-lg rounded-full font-semibold shadow-lg hover:scale-105 transition"
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.96 }}
    >
      <FiEdit className="text-2xl" />
      Schedule Exams
    </motion.button>
  </div>
</motion.div>
    ),
    // --- the rest of your pages remain the same ---
    roleManager: (
      <motion.div
    className="flex flex-col items-center justify-center w-full h-full pt-10 pb-4"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <motion.div
      className="bg-gradient-to-br from-[#e0c3fc] via-[#8ec5fc] to-[#a9c9ff] shadow-2xl rounded-3xl border border-white/60 px-10 py-12 max-w-lg w-full flex flex-col items-center relative"
      initial={{ scale: 0.97 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex justify-center">
        <div className="bg-gradient-to-br from-[#57418d] to-[#7b2ff2] p-4 rounded-full shadow-lg">
          <FiUserCheck className="text-white text-4xl" />
        </div>
      </div>
      <h2 className="text-3xl font-extrabold mb-2 text-[#38365e] text-center drop-shadow mt-6">
        Role Manager
      </h2>
      <p className="mb-8 text-[#57418d] text-center text-base font-medium">
       Assign and update user roles efficiently.
      </p>
      <form
        name="roleUpdateForm"
        id="roleUpdateForm"
        className="flex flex-col gap-8 w-full"
        onSubmit={e => {
          e.preventDefault();
          handleRoleUpdate();
        }}
      >
        <div className="flex flex-col gap-2 w-full">
          <label className="text-[#57418d] font-semibold">Select User</label>
          <select
            name="selectUser"
            id="selectUser"
            value={roleEmail}
            onChange={(e) => setRoleEmail(e.target.value)}
            className="border-2 border-purple-200 focus:border-purple-400 px-4 py-3 rounded-xl w-full shadow-md transition bg-white"
            required
          >
            <option value="">Select User</option>
            <optgroup label="Teaching Assistants (TAs)">
              {allUsers
                .filter(user => user.role === 'ta')
                .map(user => (
                  <option key={user.email} value={user.email}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </optgroup>
            <optgroup label="Students">
              {allUsers
                .filter(user => user.role === 'student')
                .map(user => (
                  <option key={user.email} value={user.email}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </optgroup>
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-[#57418d] font-semibold">Select Role</label>
          <select
            name="selectRole"
            id="selectRole"
            className="border-2 border-purple-200 focus:border-purple-400 px-4 py-3 rounded-xl w-full shadow-md transition bg-white"
            value={roleType}
            onChange={e => setRoleType(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="ta">Teaching Assistant (TA)</option>
          </select>
        </div>
        <motion.button
          type="submit"
          className="mt-2 bg-gradient-to-r from-[#57418d] to-[#7b2ff2] hover:from-[#7b2ff2] hover:to-[#57418d] text-white px-8 py-3 rounded-full font-semibold shadow-xl hover:scale-105 transition text-lg tracking-wide"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{ minWidth: 160 }}
        >
          Update Role
        </motion.button>
      </form>
    </motion.div>
  </motion.div>
    ),
  courses: (
  <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
    <h2 className="text-3xl font-extrabold mb-10 text-[#38365e] text-center drop-shadow">
      Courses and Batches
    </h2>
    <div className="w-full max-w-5xl">
      <table className="w-full border-separate border-spacing-y-4">
        <thead>
          <tr>
            <th className="bg-[#57418d] text-white py-4 px-6 rounded-l-2xl text-lg font-semibold text-center tracking-wide">
              Course Name
            </th>
            <th className="bg-[#57418d] text-white py-4 px-6 text-lg font-semibold text-center tracking-wide">
              Batch Name
            </th>
            <th className="bg-[#57418d] text-white py-4 px-6 rounded-r-2xl text-lg font-semibold text-center tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {courseBatchList.length > 0 ? (
            courseBatchList.map((row, idx) => (
              <tr key={idx} className="hover:bg-purple-50 transition">
                <td className="px-6 py-4 text-center text-base font-medium">{row.courseName}</td>
                <td className="px-6 py-4 text-center text-base font-medium">{row.batchName}</td>
                <td className="px-6 py-4 text-center text-base flex gap-2 justify-center">
                  {/* Enroll Student Button (with CSV) */}
                  <button
                    onClick={() => handleEnrollStudent(row.courseName, row.batchName)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 text-white font-semibold rounded-2xl shadow-md hover:from-green-500 hover:to-emerald-500 hover:scale-105 transition-all duration-150"
                  >
                    <FiUserPlus className="text-lg" /> Enroll Student
                  </button>
                  {/* Download CSV Button */}
                  <button
                    onClick={() => downloadCSV(row.courseName, row.batchName)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 text-white font-semibold rounded-2xl shadow-md hover:from-blue-500 hover:to-cyan-500 hover:scale-105 transition-all duration-150"
                  >
                    <FiDownload className="text-lg" /> Download CSV
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-gray-400 py-12 text-lg font-semibold">
                No courses and batches added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
),
    exams: (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h2 className="text-3xl font-bold mb-10 text-[#38365e] text-center">Exam Management</h2>
        <div className="w-full flex flex-col gap-6 max-w-2xl mb-4">
          <div className="flex flex-row gap-8">
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedBatch('');
                }}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
              >
                <option value="">Select Course</option>
                {courses
                  .filter((c) => c && c.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
                disabled={!selectedCourse}
              >
                <option value="">{!selectedCourse ? 'No Batches Available' : 'Select Batch'}</option>
                {batches
                  .filter((b) => b && b.id)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-row gap-8">
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">Exam Title</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
                placeholder="Midterm, Quiz 1, etc."
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">Number of Questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div className="flex flex-row gap-8">
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex flex-row gap-8">
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">No. of Peers (K)</label>
              <input
                type="number"
                min="1"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="border-2 border-[#b3aedd] px-4 py-2 rounded-xl outline-none"
                placeholder="e.g. 3"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-[#38365e] font-semibold mb-1">Solutions</label>
              <div className="flex items-center">
                <label className="mr-2">
                  <input
                    type="file"
                    onChange={(e) => setSolutions(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                    id="solution-file"
                  />
                  <span
                    className="inline-block px-3 py-1 bg-[#232323] text-white rounded cursor-pointer"
                    style={{ fontWeight: 500 }}
                    onClick={() => document.getElementById('solution-file')?.click()}
                  >
                    Choose File
                  </span>
                </label>
                <span className="ml-2 text-sm text-gray-700">
                  {solutions ? solutions.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={handleExamSchedule}
              disabled={
                !selectedCourse || !selectedBatch || !examTitle || !startTime || !endTime || numQuestions <= 0 || k <= 0
              }
              className={`px-6 py-2 rounded-2xl font-semibold shadow transition text-white text-base ${
                selectedCourse && selectedBatch && examTitle && startTime && endTime && numQuestions > 0 && k > 0
                  ? 'bg-[#57418d] hover:bg-[#402b6c]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Schedule Exam
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl mt-10">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr>
                <th className="bg-[#57418d] text-white py-3 px-6 rounded-l-2xl text-lg font-semibold text-center">
                  Title
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Course
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Batch
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Duration
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Total Marks
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  K
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Total Students
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 text-lg font-semibold text-center">
                  Solutions
                </th>
                <th className="bg-[#57418d] text-white py-3 px-6 rounded-r-2xl text-lg font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {examRecords.length > 0 ? (
                examRecords.map((ex, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 text-center text-base">{ex.title}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.course}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.batch}</td>
                    <td className="px-6 py-4 text-center text-base">{calculateDuration(ex.startTime, ex.endTime)}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.numQuestions * 10}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.k || '-'}</td>
                    <td className="px-6 py-4 text-center text-base">{ex.totalStudents || '-'}</td>
                    <td className="px-6 py-4 text-center text-base">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Solutions
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-base flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        Solutions
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center text-gray-500 py-4">
                    No exams scheduled yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ),
  };

  return (
    <div
      className="flex h-screen overflow-hidden backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, rgb(168, 184, 208) 0%, rgb(183, 64, 173) 100%)"
      }}
    >
<div className={`${showSidebar ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#2b2e4a] via-[#5636b8] to-[#231942] text-white flex flex-col justify-between py-6 px-4 rounded-r-3xl shadow-2xl transition-all duration-300`}>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="self-start mb-6 p-2 border-2 border-transparent hover:border-blue-300 rounded-full active:scale-95 transition"
        >
          <FiMenu className="text-2xl" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className={`font-bold mb-10 mt-4 transition-all ${showSidebar ? 'text-2xl' : 'text-lg'}`}>
            {showSidebar ? 'Teacher Panel' : 'TP'}
          </h2>
          <ul className="space-y-3 w-full">
            {['home', 'roleManager', 'courses', 'exams'].map((key) => {
              const icons: Record<string, any> = { home: FiHome, roleManager: FiShield, courses: FiBook, exams: FiEdit };
              const Icon = icons[key];
              return (
                <li
  key={key}
  onClick={() => setActivePage(key)}
  className={`cursor-pointer 
    ${activePage === key
      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg scale-105'
      : 'hover:bg-white/10 hover:scale-105'}
    flex items-center px-4 py-2 rounded-xl transition-all duration-200`}
>
  <Icon className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'} ${!showSidebar ? 'text-3xl md:text-4xl' : ''}`} />
  {showSidebar && (key === 'roleManager' ? 'Manage Roles' : key.charAt(0).toUpperCase() + key.slice(1))}
</li>
              );
            })}
          </ul>
        </div>
        <button
          onClick={() => setLogoutDialog(true)}
          className="flex items-center justify-center gap-2 hover:bg-white/10 hover:text-red-400 px-4 py-2 rounded transition-all duration-200">
        
          <FiLogOut className={`${showSidebar ? 'mr-2 text-xl' : 'text-3xl'} ${!showSidebar ? 'text-3xl md:text-4xl' : ''}`} />
          {showSidebar && 'Logout'}
        </button>
      </div>

      <div className="flex-1 relative overflow-y-auto flex justify-center items-start">
        <div className="absolute top-4 right-6 z-20">
          <button onClick={() => setShowProfilePopup(!showProfilePopup)}
            className="p-2 flex items-center justify-center rounded-full border-2 border-transparent hover:border-blue-300 transition active:scale-95 bg-white shadow"
            style={{ boxShadow: '0 2px 14px 0 rgba(87,65,141,0.16)' }}
          >
            <ProfileSVG />
          </button>
          {showProfilePopup && (
              <div
                className="absolute right-0 mt-3 w-80 bg-white p-4 rounded-b-3xl shadow-lg z-10"
                style={{
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  boxShadow: '0 2px 14px 0 rgba(87,65,141,0.16)'
                }}
              >
                <h2 className="text-xl font-bold mb-4">Profile Info</h2>
                <div className="space-y-2 mb-4">
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Role:</strong> {profileData.role}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfilePopup(false);
                  }}
                  className="bg-purple-700 text-white px-4 py-2 rounded-3xl w-full"
                >
                  OK
                </button>
              </div>
            )}
        </div>

        <div
         className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-6xl h-auto mt-20 mb-10 mx-6 px-8 py-6 flex flex-col items-start justify-start overflow-auto backdrop-blur-sm"

          style={{
            minHeight: "calc(100vh - 120px)",
            boxShadow: '0 2px 24px 0 rgba(87,65,141,0.10)'
          }}
        >
          <div className="w-full">
            {pages[activePage]}
          </div>
        </div>

        <DialogBox show={showProfileMsg} message="Profile Saved Successfully!" />
        <DialogBox show={showExamMsg} message="Exam Scheduled Successfully!" />
        <DialogBox show={showRoleMsg} message="Role Updated Successfully!" />

   {showEnrollModal && (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <form
      onSubmit={handleEnrollSubmit}
      className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center w-[350px] max-w-full"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Enroll Student</h2>
      <div className="flex flex-col gap-3 w-full">
        <div>
          <label className="font-semibold">Course:</label>
          <input
            value={enrollCourse}
            disabled
            className="border px-3 py-2 rounded w-full mt-1 bg-gray-100"
          />
        </div>
        <div>
          <label className="font-semibold">Batch:</label>
          <input
            value={enrollBatch}
            disabled
            className="border px-3 py-2 rounded w-full mt-1 bg-gray-100"
          />
        </div>
        {/* --- CSV Upload Block (UI only, no backend) --- */}
        <div className="flex flex-col items-center w-full my-2">
          <label className="font-semibold mb-2 text-center w-full">Bulk Enroll via CSV</label>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                setEnrollError("Please upload a CSV file.");
                return;
              }
              if (!file.name.endsWith('.csv')) {
                setEnrollError("Please upload a valid CSV file only.");
                return;
              }
              setEnrollError('');
              setCsvFileName(file.name);

              // CSV Parse Logic
              const text = await file.text();
              const rows = text.split("\n").map(r => r.trim()).filter(Boolean);
              let dataRows = rows;
              if (rows[0].toLowerCase().includes('name') && rows[0].toLowerCase().includes('email')) {
                dataRows = rows.slice(1);
              }
              const students = dataRows.map((row) => {
                const [name, email] = row.split(",");
                return { name: name?.trim(), email: email?.trim() };
              }).filter(s => s.name && s.email);

              // Add students to enrolledStudents state (frontend only)
              const key = `${enrollCourse}_${enrollBatch}`;
              setEnrolledStudents(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), ...students]
              }));
            }}
          />
          <label
            htmlFor="csv-upload"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 text-white font-semibold rounded-2xl shadow hover:from-green-500 hover:to-emerald-500 hover:scale-105 transition-all cursor-pointer"
            style={{ minWidth: 0 }}
          >
            <FiDownload className="text-lg" /> Choose CSV File
          </label>
          <span className="text-xs text-gray-500 mt-1">{csvFileName ? csvFileName : "No file chosen"}</span>
          <span className="text-xs text-gray-500 mt-1">Upload a CSV file with columns: Name, Email</span>
        </div>
      </div>

      {/* Error message block */}
      {enrollError && (
        <div className="mb-2 text-red-600 font-semibold text-center">
          {enrollError}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          className="bg-[#57418d] text-white px-8 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c]"
        >
          Enroll
        </button>
        <button
          type="button"
          onClick={() => {
            setShowEnrollModal(false);
            setEnrollError('');
          }}
          className="bg-gray-200 text-gray-700 rounded-2xl px-8 py-2 font-semibold hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
      {enrollSuccess && (
        <div className="mt-4 text-green-600 font-semibold text-center">
          Student enrolled successfully!
        </div>
      )}
      
      <div className="mt-4 w-full">
        <div className="font-semibold mb-1">Enrolled Students:</div>
      <ul className="max-h-24 overflow-y-auto text-sm">
  {(enrolledStudents[`${enrollCourse}_${enrollBatch}`] || []).length === 0 ? (
    <li className="text-gray-400">No students enrolled yet.</li>
  ) : (
    (enrolledStudents[`${enrollCourse}_${enrollBatch}`] || []).map((s, i) => (
      <li key={i} className="mb-1">
        {s.name} ({s.email})
      </li>
    ))
  )}
</ul>
      </div>
    </form>
  </div>
)}
        <DialogBox show={logoutDialog} message="Are you sure you want to logout?">
          <div className="flex gap-8 mt-4">
            <button
              onClick={() => setLogoutDialog(false)}
              className="bg-gray-200 text-gray-700 roundeFd-xl px-8 py-2 font-semibold hover:bg-gray-300 transition"
            >
              No
            </button>
            <button
              onClick={() => {
                setLogoutDialog(false);
                if (onLogout) {
                  onLogout();
                } else {
                  window.location.href = "/login";
                }
              }}
              className="bg-red-500 text-white rounded-xl px-8 py-2 font-semibold hover:bg-red-600 transition"
            >
              Yes
            </button>
          </div>
        </DialogBox>
      </div>

      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="h-12 w-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.397-.164-.853-.142-1.203.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.806.272 1.203.107.397-.165.71-.505.781-.929l.149-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {showSettings && (
          <div className="mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl p-4 text-sm space-y-4 w-60">
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-800 dark:text-white">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 rounded-full peer dark:bg-gray-600 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;