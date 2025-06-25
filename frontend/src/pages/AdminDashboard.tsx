import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBook, FaUserGraduate, FaBoxes, FaHome } from 'react-icons/fa';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import axios from 'axios';

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

type Tab = 'home' | 'course' | 'batch'| 'role' ;
type Course = {
  _id: string;
  name: string;
  code: string;
};

const AdminDashboard = () => {
  const token = localStorage.getItem('token');
  const [counts, setCounts] = useState({ teachers: 0, courses: 0, students: 0 });
  const [profileData, setProfileData] = useState({ name: "", email: "", role: "" });
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseIdToDelete, setCourseIdToDelete] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCourseMsg, setShowCourseMsg] = useState(false);
  const [showCourseDelMsg, setShowCourseDelMsg] = useState(false);

  const [batches, setBatches] = useState<any[]>([]);

  const [allUsers, setAllUsers] = useState<{ role: string; email: string; name: string }[]>([]);
  const [showRoleMsg, setShowRoleMsg] = useState(false);
  const [roleEmail, setRoleEmail] = useState("");
  const [roleType, setRoleType] = useState("Admin");
 
  const navigate = useNavigate();

  // Fetch profile data
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
          //setProfileSaved(!!data.name && !!data.email && !!data.role);
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err);
        });
    }, []);
  
      const ProfileSVG = () => (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <circle cx="19" cy="19" r="19" fill="#57418d" />
          <circle cx="19" cy="14" r="7" fill="#fff" />
          <ellipse cx="19" cy="29.5" rx="11" ry="7.5" fill="#fff" />
        </svg>
      );

  // Role Manager

  const fetchAllUsers = () => {
      fetch(`http://localhost:${PORT}/api/admin/users`)
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
      if (!roleEmail || !roleType) {
        alert('Please select a user and a role');
        return;
      }
      fetch(`http://localhost:${PORT}/api/admin/update-role`, {
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
          setRoleType('admin');
        });
    };

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

  useEffect(() => {
    fetch(`http://localhost:${PORT}/api/dashboard/counts`)
      .then(res => res.json())
      .then(data => {
        setCounts({
          teachers: data.teachers,
          courses: data.courses,
          students: data.students,
        });
      })
      .catch(err => console.error('Failed to fetch dashboard counts:', err));
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddCourse = async () => {
    try {
      await axios.post(
        `http://localhost:${PORT}/api/admin/courses`,
        {
          name: courseName,
          code: courseCode,
          startDate,  // already in yyyy-mm-dd from <input type="date" />
          endDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      //alert('Course added successfully');
      setShowCourseMsg(true);
      setTimeout(() => setShowCourseMsg(false), 1200);
      setCourseName('');
      setCourseCode('');
      setStartDate('');
      setEndDate('');
      fetchCourses();
    } catch (error) {
      console.error(error);
      alert('Failed to add course');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`http://localhost:${PORT}/api/admin/courses/code/${courseIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      //alert('Course deleted');
      setShowCourseDelMsg(true);
      setTimeout(() => setShowCourseDelMsg(false), 1200);
      setCourseIdToDelete('');
      fetchCourses();
    } catch (error: any) {
      console.error(error);
      alert('Failed to delete course');
    }
  };

  useEffect(() => {
    if (activeTab === 'course') {
      fetchCourses();
    }
  }, [activeTab]);

  
  const fetchBatches = async () => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/admin/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'batch') {
      fetchBatches();
      fetchCourses();
    }
  }, [activeTab]);

  
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
            <h1 className="text-4xl font-bold text-[#38365e] text-center mb-6">
              Welcome to Admin Dashboard
            </h1>
            <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 w-full max-w-2xl">
              <button
                onClick={() => setActiveTab('course')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                Manage Courses
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                View Batches
              </button>
              <button
                onClick={() => setActiveTab('role')}
                className="bg-purple-700 text-white px-10 py-4 text-lg rounded-3xl"
              >
                Manage Roles
              </button>
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
              <div
                className="cursor-pointer bg-[#57418d] text-white p-6 rounded-3xl shadow-md text-center hover:bg-[#402b6c] transition"
              >
                <FaChalkboardTeacher size={32} className="mx-auto mb-2" />
                <h2 className="text-lg font-semibold">Teachers</h2>
                <p className="text-sm">{counts.teachers}</p>
              </div>
              <div
                onClick={() => setActiveTab('course')}
                className="cursor-pointer bg-[#57418d] text-white p-6 rounded-3xl shadow-md text-center hover:bg-[#402b6c] transition"
              >
                <FaBook size={32} className="mx-auto mb-2" />
                <h2 className="text-lg font-semibold">Courses</h2>
                <p className="text-sm">{counts.courses}</p>
              </div>
              <div
                className="cursor-pointer bg-[#57418d] text-white p-6 rounded-3xl shadow-md text-center hover:bg-[#402b6c] transition"
              >
                <FaUserGraduate size={32} className="mx-auto mb-2" />
                <h2 className="text-lg font-semibold">Students</h2>
                <p className="text-sm">{counts.students}</p>
              </div>
            </div>
          </div>
        );
   case 'role':
      return (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h2 className="text-3xl font-bold text-[#38365e] text-center mb-8">Role Manager</h2>
        <div className="w-full flex flex-col items-start px-6 max-w-xl">
          <p className="mb-8 text-[#38365e] text-left">
            Update the role of a user by selecting their name and their new role.
          </p>
          <form
            name="roleUpdateForm"
            id="roleUpdateForm"
            className="flex flex-col gap-6 w-full"
            onSubmit={e => {
              e.preventDefault();
              handleRoleUpdate();
            }}
          >
            <div className="flex flex-col items-start gap-1 w-full">
              <div className="flex flex-col items-start gap-1 w-full">
                <label className="text-[#38365e] font-semibold mb-1">Select User</label>
                <select
                  name="selectUser"
                  id="selectUser"
                  value={roleEmail}
                  onChange={(e) => setRoleEmail(e.target.value)}
                  className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full"
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
            </div>
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="text-[#38365e] font-semibold mb-1">Select Role</label>
              <select
                name="selectRole"
                id="selectRole"
                className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="ta">Teaching Assistant (TA)</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#57418d] text-white px-7 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c] mt-2"
              style={{ minWidth: 140 }}
            >
              Update Role
            </button>
          </form>
        </div>
      </div>
    );
   case 'course':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow">
              <h2 className="text-xl font-bold mb-4">Add New Course</h2>
              <input
                name="courseName"
                id="courseName"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter Course Name"
                className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full mb-2"
              />
              <input
                name="courseCode"
                id="courseCode"
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Enter Course Code"
                className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full mb-4"
                
              />
              <label className="block mb-2">Course Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input mb-2 w-full border focus:border-blue-400 px-4 py-2 rounded-xl"
              />

              <label className="block mb-2">Course End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input mb-4 w-full border focus:border-blue-400 px-4 py-2 rounded-xl"
              />

              <button
                onClick={handleAddCourse}
                className="bg-[#57418d] text-white px-7 py-2 rounded-2xl font-semibold shadow transition hover:bg-[#402b6c]"
              >
                Add Course
              </button>
              
            </div>
            <div className="bg-white p-6 rounded-3xl shadow">
              <h2 className="text-xl font-bold mb-4">Remove Course</h2>
              <select
                name="courseIdToDelete"
                id="courseIdToDelete"
                value={courseIdToDelete}
                onChange={(e) => setCourseIdToDelete(e.target.value)}
                className="border focus:border-blue-400 px-4 py-2 rounded-xl w-full mb-4"
              >
                <option value="">Select Course</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course.code}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              <button
                onClick={handleDeleteCourse}
                className="bg-red-600 text-white px-7 py-2 rounded-2xl font-semibold shadow transition hover:bg-red-700"
              >
                Remove Course
              </button>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow col-span-full">
              <h2 className="text-xl font-bold mb-4">All Courses</h2>
              <ul className="space-y-2">
                {courses.map((course) => (
                  <li key={course._id} className="border-b pb-2">
                    <strong>{course.name}</strong> — <code>{course.code}</code>
                    <br />
                    {/*<span className="text-sm text-gray-500">
                      Start: {new Date(course.startDate).toLocaleDateString()} – End: {new Date(course.endDate).toLocaleDateString()}
                    </span>*/}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'batch':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">            
            <div className="bg-white p-6 rounded-3xl shadow col-span-full">
              <h2 className="text-xl font-bold mb-4">All Batches</h2>
              <ul className="space-y-2">
                {batches.map((batch: any) => (
                  <li key={batch._id} className="border-b pb-2">
                    <strong>{batch.name}</strong> — {batch.course?.name} ({batch.course?.code})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(180deg,#ffe3ec 80%,#f0f0f5 100%)" }}>
      {/* Success Dialog */}
      <DialogBox show={showRoleMsg} message="Role Updated Successfully!" />
      <DialogBox show={showCourseMsg} message="Course Added Successfully!" />
      <DialogBox show={showCourseDelMsg} message="Course Delete Successfully!" />
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-20'} bg-gradient-to-b from-[#493a6b] to-[#2D2150] text-white flex flex-col justify-between py-6 px-4 rounded-r-3xl transition-all duration-300`}>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="self-start mb-6 p-2 border-2 border-transparent hover:border-blue-300 rounded-full active:scale-95 transition"
        >
          <FiMenu className="text-2xl" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className={`font-bold mb-10 mt-4 transition-all ${showSidebar ? 'text-2xl' : 'text-lg'}`}>
            {showSidebar ? 'Admin Panel' : 'Admin'}
          </h2>
          <ul className="space-y-3 w-full">
            <li onClick={() => setActiveTab('home')}
              className={`cursor-pointer ${activeTab === 'home' ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}>
              <FaHome className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && 'Home'}
            </li>
            <li onClick={() => setActiveTab('course')}
              className={`cursor-pointer ${activeTab === 'course' ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}>
              <FaBook className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && 'Course Manager'}
            </li>
            <li onClick={() => setActiveTab('batch')}
              className={`cursor-pointer ${activeTab === 'batch' ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}>
              <FaBoxes className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && 'Batch Manager'}
            </li>
            <li
            onClick={() => setActiveTab('role')}
            className={`cursor-pointer ${activeTab === 'role' ? 'bg-[#57418d]' : ''} flex items-center px-4 py-2 rounded transition`}>
             <FaUserGraduate className={`transition-all ${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
              {showSidebar && 'Role Manager'}
            </li>
          </ul>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 hover:text-red-400 transition"
        >
          <FiLogOut className={`${showSidebar ? 'mr-2 text-xl' : 'text-3xl'}`} />
          {showSidebar && 'Logout'}
        </button>
        {/* Logout Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-100 z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center">
              <h2 className="text-lg text-black font-semibold mb-4">Are you sure you want to logout?</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 relative overflow-y-auto flex justify-center items-start">
        <div className="bg-white rounded-3xl shadow-lg w-full h-auto mt-24 mb-8 mx-4 p-0 flex items-start justify-center overflow-auto max-w-6xl"
          style={{
            minHeight: "calc(100vh - 120px)",
            boxShadow: '0 2px 24px 0 rgba(87,65,141,0.10)'
          }}
        >
          <div className="w-full">{renderContent()}</div>
        </div>
      </div>
      {/* Profile button */}
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
                    //setActivePage("profile");
                    setShowProfilePopup(false);
                  }}
                  className="bg-purple-700 text-white px-4 py-2 rounded-3xl w-full"
                >
                  OK
                </button>
              </div>
            )}
        </div>
      {/* Settings Button */}
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

export default AdminDashboard;
