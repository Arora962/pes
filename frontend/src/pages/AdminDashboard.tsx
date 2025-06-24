import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
const PORT = 5000; // Hardcoded port as import.meta.env is not available

type Tab = 'home' | 'course' | 'batch' | 'role';

type Course = {
  _id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
};

const lightPalette = {
    'bg-primary': '#FFFBF6',         
    'bg-secondary': '#FFFAF2',       
    'accent-bright-yellow': '#FFD700',
    'accent-light-yellow': '#FFECB3', 
    'accent-pink': '#FF8DA1',        
    'accent-lilac': '#C8A2C8',       
    'accent-purple': '#800080',      
    'accent-light-purple': '#DDA0DD',
    'sidebar-bg': '#E6E6FA',         
    'text-dark': '#4B0082',          
    'text-muted': '#A9A9A9',         
    'text-sidebar-dark': '#4B0082',  
    'border-soft': '#F0E6EF',        
    'shadow-light': 'rgba(128, 0, 128, 0.04)',  
    'shadow-medium': 'rgba(128, 0, 128, 0.08)', 
    'shadow-strong': 'rgba(128, 0, 128, 0.15)', 
};

// Dark mode specific colors
const darkPalette = {
    'bg-primary': '#1A1A2E',
    'bg-secondary': '#16213E',
    'accent-bright-yellow': '#FFEB3B',
    'accent-light-yellow': '#FFEE58',
    'accent-pink': '#EC407A',
    'accent-lilac': '#9C27B0',
    'accent-purple': '#6A1B9A',
    'accent-light-purple': '#8E24AA',
    'sidebar-bg': '#0F3460',
    'text-dark': '#E0E0E0',
    'text-muted': '#B0BEC5',
    'text-sidebar-dark': '#E0E0E0',
    'border-soft': '#3F51B5',
    'shadow-light': 'rgba(0, 0, 0, 0.2)',
    'shadow-medium': 'rgba(0, 0, 0, 0.4)',
    'shadow-strong': 'rgba(0, 0, 0, 0.6)',
};

type Palette = typeof lightPalette;

const getColors = (isDarkMode: boolean): Palette => isDarkMode ? darkPalette : lightPalette;

// A simple Toast component (adapted from StudentDashboard)
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
    const [darkMode] = useState(document.documentElement.classList.contains('dark')); // Check initial dark mode state
    const currentPalette = getColors(darkMode);

    const bgColor = type === 'success' ? currentPalette['accent-lilac'] : currentPalette['accent-pink'];
    const textColor = 'white'; // Keep white for contrast for toasts

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-xl flex items-center space-x-3 z-50 min-w-[250px] justify-between"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <span className="text-2xl">{type === 'success' ? '✅' : '❌'}</span>
            <span className="text-lg font-medium flex-grow text-center">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200">
                <span className="text-xl">✖️</span>
            </button>
        </motion.div>
    );
};

// A reusable Modal component (adapted from StudentDashboard style)
const Modal = ({ show, onClose, onConfirm, title, children }: { show: boolean, onClose: () => void, onConfirm: () => void, title: string, children: React.ReactNode }) => {
    const [darkMode] = useState(document.documentElement.classList.contains('dark'));
    const currentPalette = getColors(darkMode);

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="rounded-2xl p-6 w-full max-w-md m-4 shadow-xl text-center"
                style={{ backgroundColor: currentPalette['bg-primary'], boxShadow: `0 8px 25px ${currentPalette['shadow-strong']}` }}
            >
                <h3 className="text-xl font-bold mb-4" style={{ color: currentPalette['text-dark'] }}>{title}</h3>
                <div className="mb-6" style={{ color: currentPalette['text-muted'] }}>{children}</div>
                <div className="flex justify-around gap-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg font-semibold shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                            backgroundColor: currentPalette['accent-purple'],
                            color: 'white',
                            boxShadow: `0 4px 15px ${currentPalette['accent-purple']}40`,
                            '--tw-ring-color': currentPalette['accent-purple'] + '50',
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('token'));

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  
  // Data State
  const [counts, setCounts] = useState({ teachers: 0, courses: 0, students: 0 });
  const [profileData, setProfileData] = useState({ name: "", email: "", role: "" });
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<{ role: string; email: string; name: string }[]>([]);

  // Form & Message State
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [courseIdToDelete, setCourseIdToDelete] = useState('');
  const [roleEmail, setRoleEmail] = useState("");
  const [roleType, setRoleType] = useState("student"); // Default to student
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');


  const currentPalette = getColors(darkMode); // Get current palette based on dark mode state


  // Apply dark mode on initial load and when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Generic data fetching function
  const fetchData = async (url: string, setter: Function, errorMessage: string) => {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setter(res.data);
    } catch (error) {
      console.error(errorMessage, error);
    }
  };

  // Fetch initial data for the dashboard
  useEffect(() => {
    if (!token) {
        navigate('/'); // Redirect to login
        return;
    }
    fetchData(`http://localhost:${PORT}/api/dashboard/profile`, setProfileData, 'Failed to fetch profile');
    fetchData(`http://localhost:${PORT}/api/dashboard/counts`, setCounts, 'Failed to fetch counts');
    fetchData(`http://localhost:${PORT}/api/admin/users`, setAllUsers, 'Failed to fetch users');
  }, [token, navigate]);
  
  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'course') {
        fetchData(`http://localhost:${PORT}/api/admin/courses`, setCourses, 'Error fetching courses');
    }
    if (activeTab === 'batch') {
        fetchData(`http://localhost:${PORT}/api/admin/batches`, setBatches, 'Error fetching batches');
        fetchData(`http://localhost:${PORT}/api/admin/courses`, setCourses, 'Error fetching courses for batches');
    }
    if(activeTab === 'role') {
        fetchData(`http://localhost:${PORT}/api/admin/users`, setAllUsers, 'Failed to fetch users');
    }
  }, [activeTab]);


  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:${PORT}/api/admin/courses`, { name: courseName, code: courseCode, startDate, endDate }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Course added successfully');
      setCourseName('');
      setCourseCode('');
      setStartDate('');
      setEndDate('');
      fetchData(`http://localhost:${PORT}/api/admin/courses`, setCourses, 'Error refetching courses');
    } catch (error) {
      console.error(error);
      showToast('Failed to add course', 'error');
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseIdToDelete) {
        showToast("Please select a course to delete.", 'error');
        return;
    }
    try {
      await axios.delete(`http://localhost:${PORT}/api/admin/courses/code/${courseIdToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Course deleted');
      setCourseIdToDelete('');
      fetchData(`http://localhost:${PORT}/api/admin/courses`, setCourses, 'Error refetching courses');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete course', 'error');
    }
  };

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleEmail || !roleType) {
      showToast('Please select a user and a role', 'error');
      return;
    }
    try {
        await axios.post(`http://localhost:${PORT}/api/admin/update-role`, { email: roleEmail, role: roleType }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        showToast('Role updated successfully');
        fetchData(`http://localhost:${PORT}/api/admin/users`, setAllUsers, 'Failed to refetch users');
        setRoleEmail('');
        setRoleType('student');
    } catch(error) {
        console.error("Failed to update role", error);
        showToast("Failed to update role", 'error');
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Common Tailwind classes for cards and buttons based on the new palette
  const commonCardClasses = `
      rounded-xl p-6 space-y-4 border transition-all duration-300
      hover:shadow-xl transform hover:translate-y-[-4px]
  `;
  const getCardStyles = () => ({
      backgroundColor: currentPalette['bg-secondary'],
      borderColor: currentPalette['border-soft'],
      boxShadow: `0 8px 20px ${currentPalette['shadow-medium']}`,
  });

  const commonButtonClasses = `
      px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md active:scale-95 transform
      focus:outline-none focus:ring-2 focus:ring-offset-2
  `;
    const getButtonStyles = (colorKey: keyof Palette, textColorKey: 'white' | 'text-dark' = 'text-dark') => { // Added 'text-dark' to textColorKey type
        let bgColor = currentPalette[colorKey];
        let textColor = currentPalette[textColorKey];

        // Ensure text is white for accent-purple and accent-pink for better contrast
        if (colorKey === 'accent-purple' || colorKey === 'accent-pink') {
            textColor = 'white';
        }
        
        return {
            backgroundColor: bgColor,
            color: textColor,
            boxShadow: `0 4px 15px ${currentPalette[colorKey]}40`,
            '--tw-ring-color': currentPalette[colorKey] + '50', // For focus ring
        };
    };


  // Replaced react-icons with Unicode characters/emojis
  const SidebarLink = ({ tabName, icon: IconSVG, text }: { tabName: Tab, icon: React.ReactNode, text: string }) => (
    <motion.li
      key={tabName}
      onClick={() => setActiveTab(tabName)}
      className={`cursor-pointer flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform
          ${activeTab === tabName ? 'scale-100 relative' : 'hover:scale-[1.02]'}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      `}
      style={{
          color: currentPalette['text-sidebar-dark'],
          '--tw-ring-color': currentPalette['accent-lilac'] + '70',
      }}
      whileHover={{ scale: 1.03, x: 5, boxShadow: `0 0 10px ${currentPalette['shadow-light']}` }}
      whileTap={{ scale: 0.98 }}
    >
      {activeTab === tabName && (
        <motion.div
            layoutId="activePill"
            className="absolute inset-0 rounded-lg -z-10"
            style={{
                backgroundColor: currentPalette['accent-light-purple'] + '20',
                boxShadow: `0 0 15px ${currentPalette['accent-light-purple']}40`
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className={`transition-all duration-300 ${showSidebar ? 'mr-3 text-xl' : 'text-3xl'}`}>{IconSVG}</span>
      {showSidebar && <span className="font-medium whitespace-nowrap">{text}</span>}
    </motion.li>
  );
  
  const StatCard = ({ title, value, icon: IconSVG, onMoreClick }: { title: string, value: number, icon: React.ReactNode, onMoreClick?: () => void }) => (
      <motion.div
          onClick={onMoreClick}
          className={`${commonCardClasses} flex items-center justify-between cursor-pointer`}
          style={getCardStyles()}
          whileHover={{ scale: 1.03, y: -4, boxShadow: `0 10px 25px ${currentPalette['shadow-medium']}` }}
          whileTap={{ scale: 0.98 }}
      >
          <div>
              <p className="text-sm font-medium uppercase" style={{ color: currentPalette['text-muted'] }}>{title}</p>
              <p className="text-3xl font-bold" style={{ color: currentPalette['text-dark'] }}>{value}</p>
          </div>
          <div className="p-4 rounded-full" style={{ backgroundColor: currentPalette['accent-lilac'] + '20' }}>
            <span className="text-2xl" style={{ color: currentPalette['accent-purple'] }}>{IconSVG}</span>
          </div>
      </motion.div>
  );

  const renderContent = () => {
    const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className={`${commonCardClasses} w-full`} style={getCardStyles()}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: currentPalette['text-dark'] }}>{title}</h2>
            {children}
        </div>
    );
    const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input {...props} 
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition text-base font-sans"
            style={{
                borderColor: currentPalette['border-soft'],
                backgroundColor: currentPalette['bg-primary'],
                color: currentPalette['text-dark'],
                boxShadow: `0 2px 8px ${currentPalette['shadow-light']}`,
                '--tw-ring-color': currentPalette['accent-lilac'] + '70',
            }}
        />
    );
    const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
        <textarea {...props}
            className="w-full p-4 rounded-xl border-2 resize-y font-sans transition-all duration-300 ease-in focus:outline-none focus:shadow-md text-base"
            style={{
                borderColor: currentPalette['border-soft'],
                backgroundColor: currentPalette['bg-primary'],
                color: currentPalette['text-dark'],
                boxShadow: `0 4px 12px ${currentPalette['shadow-light']}`,
                '--tw-ring-color': currentPalette['accent-lilac'] + '70',
            }}
        />
    );
    const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
        <select {...props} 
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition text-base font-sans"
            style={{
                borderColor: currentPalette['border-soft'],
                backgroundColor: currentPalette['bg-primary'],
                color: currentPalette['text-dark'],
                boxShadow: `0 2px 8px ${currentPalette['shadow-light']}`,
                '--tw-ring-color': currentPalette['accent-lilac'] + '70',
            }}
        />
    );
    const Button = ({ children, onClick, type = 'button', variant = 'primary' }: { children: React.ReactNode, onClick?: (e: any) => void, type?: 'button' | 'submit' | 'reset', variant?: 'primary' | 'danger' | 'light-contrast' }) => {
        let buttonPaletteKey: keyof Palette;
        let textColorKey: 'white' | 'text-dark' = 'white';

        if (variant === 'primary') {
            buttonPaletteKey = 'accent-purple';
            textColorKey = 'white';
        } else if (variant === 'danger') {
            buttonPaletteKey = 'accent-pink';
            textColorKey = 'white';
        } else if (variant === 'light-contrast') {
            buttonPaletteKey = 'accent-lilac'; // Light contrasting color
            textColorKey = 'text-dark'; // Dark text for contrast on light background
        } else {
            buttonPaletteKey = 'accent-purple'; // Default to primary
        }

        return (
            <motion.button
                type={type}
                onClick={onClick}
                className={commonButtonClasses}
                style={getButtonStyles(buttonPaletteKey, textColorKey)}
                whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${currentPalette[buttonPaletteKey]}60` }}
                whileTap={{ scale: 0.95 }}
            >
                {children}
            </motion.button>
        );
    };

    // New HomeButton component for quick actions with lightly contrasting style
    const HomeButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
        <motion.button
            onClick={onClick}
            className="px-6 py-3 rounded-xl font-semibold shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
            style={{
                backgroundColor: currentPalette['accent-lilac'], // Using accent-lilac for light contrast
                color: currentPalette['text-dark'], // Dark text on lilac for visibility
                boxShadow: `0 4px 15px ${currentPalette['accent-lilac']}40`,
                '--tw-ring-color': currentPalette['accent-lilac'] + '50',
            }}
            whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${currentPalette['accent-lilac']}60` }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    );

    switch (activeTab) {
      case 'home':
        return (
            <div className='w-full'>
                <h1 className="text-3xl font-bold mb-6" style={{ color: currentPalette['text-dark'] }}>Welcome, {profileData.name || 'Admin'}!</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Teachers" value={counts.teachers} icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-2">
                            <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
                        </svg>
                    } />
                    <StatCard title="Students" value={counts.students} icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                    } />
                    <StatCard title="Courses" value={counts.courses} icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h6z"/>
                        </svg>
                    } onMoreClick={() => setActiveTab('course')} />
                </div>
                <Card title="Quick Actions">
                    <div className="flex flex-wrap gap-4">
                        <HomeButton onClick={() => setActiveTab('course')}>Manage Courses</HomeButton>
                        <HomeButton onClick={() => setActiveTab('batch')}>View Batches</HomeButton>
                        <HomeButton onClick={() => setActiveTab('role')}>Manage Roles</HomeButton>
                    </div>
                </Card>
            </div>
        );
      case 'role':
        return (
            <Card title="Role Manager">
                <p className="text-base mb-6" style={{ color: currentPalette['text-muted'] }}>Update the role of a user by selecting their email and assigning a new role.</p>
                <form onSubmit={handleRoleUpdate} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: currentPalette['text-dark'] }}>User</label>
                        <Select value={roleEmail} onChange={(e) => setRoleEmail(e.target.value)} required>
                            <option value="" disabled>Select a User</option>
                            {allUsers.map(user => (
                                <option key={user.email} value={user.email}>{user.name} ({user.email})</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1" style={{ color: currentPalette['text-dark'] }}>New Role</label>
                        <Select value={roleType} onChange={(e) => setRoleType(e.target.value)} required>
                            <option value="student">Student</option>
                            <option value="ta">Teaching Assistant (TA)</option>
                            <option value="admin">Admin</option>
                        </Select>
                    </div>
                    <div className="pt-2">
                        <Button type="submit" variant="light-contrast">Update Role</Button>
                    </div>
                </form>
            </Card>
        );
      case 'course':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <Card title="Manage Courses">
                     <form onSubmit={handleAddCourse} className="space-y-4 mb-8">
                        <h3 className="font-semibold text-lg" style={{ color: currentPalette['text-dark'] }}>Add New Course</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: currentPalette['text-dark'] }}>Course Name</label>
                            <Input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g., Introduction to React" required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1" style={{ color: currentPalette['text-dark'] }}>Course Code</label>
                            <Input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g., CS101" required />
                        </div>
                         <div>
                           <label className="block text-sm font-medium mb-1" style={{ color: currentPalette['text-dark'] }}>Start Date</label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium mb-1" style={{ color: currentPalette['text-dark'] }}>End Date</label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                        </div>
                        <div className="pt-2">
                            <Button type="submit" variant="light-contrast">Add Course</Button>
                        </div>
                    </form>
                    <div className="border-t pt-6 space-y-4" style={{ borderColor: currentPalette['border-soft'] }}>
                         <h3 className="font-semibold text-lg" style={{ color: currentPalette['text-dark'] }}>Remove Course</h3>
                         <Select value={courseIdToDelete} onChange={(e) => setCourseIdToDelete(e.target.value)} required>
                             <option value="" disabled>Select course to delete</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course.code}>{course.name} ({course.code})</option>
                            ))}
                         </Select>
                         <Button onClick={handleDeleteCourse} variant="danger">Remove Course</Button>
                    </div>
                </Card>
                <Card title="All Courses">
                    <ul className="space-y-3 h-96 overflow-y-auto pr-2">
                        {courses.length > 0 ? courses.map((course) => (
                            <li key={course._id} 
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: currentPalette['bg-primary'],
                                    color: currentPalette['text-dark'],
                                    boxShadow: `0 2px 8px ${currentPalette['shadow-light']}`
                                }}
                            >
                                <p className="font-semibold">{course.name}</p>
                                <p className="text-sm" style={{ color: currentPalette['text-muted'] }}>{course.code}</p>
                                <p className="text-xs mt-2" style={{ color: currentPalette['text-muted'] }}>
                                    {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                                </p>
                            </li>
                        )) : <p className="text-base" style={{ color: currentPalette['text-muted'] }}>No courses available.</p>}
                    </ul>
                </Card>
            </div>
        );
      case 'batch':
        return (
          <Card title="All Batches">
             <ul className="space-y-3">
                {batches.length > 0 ? batches.map((batch: any) => (
                    <li key={batch._id} 
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: currentPalette['bg-primary'],
                            color: currentPalette['text-dark'],
                            boxShadow: `0 2px 8px ${currentPalette['shadow-light']}`
                        }}
                    >
                        <p className="font-semibold">{batch.name}</p>
                        <p className="text-sm" style={{ color: currentPalette['text-muted'] }}>{batch.course?.name} ({batch.course?.code})</p>
                    </li>
                )) : <p className="text-base" style={{ color: currentPalette['text-muted'] }}>No batches available.</p>}
            </ul>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden" style={{ background: currentPalette['bg-primary'] }}>
      {/* Subtle background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(currentPalette['text-muted'])}' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M3 0L0 3l3 3 3-3z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
          background: `linear-gradient(135deg, ${currentPalette['bg-primary']} 0%, ${currentPalette['bg-primary']} 50%, ${currentPalette['bg-primary']} 100%)`
      }}></div>

      <AnimatePresence>
          {showLogoutModal && (
              <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} title="Confirm Logout">
                Are you sure you want to log out?
              </Modal>
          )}
      </AnimatePresence>
      <AnimatePresence>
          {toastMessage && (
              <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
          )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
          className={`flex flex-col justify-between py-6 px-4 rounded-r-3xl transition-all duration-300 shadow-xl z-20 overflow-hidden ${showSidebar ? 'w-64' : 'w-20'}`}
          style={{
              backgroundColor: currentPalette['sidebar-bg'],
              backgroundImage: `linear-gradient(180deg, ${currentPalette['sidebar-bg']}, ${currentPalette['sidebar-bg']}E0)`,
              boxShadow: `8px 0 30px ${currentPalette['shadow-medium']}`
          }}
      >
        <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="self-start mb-6 p-2 border-2 border-transparent rounded-full active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2"
            style={{ borderColor: currentPalette['accent-lilac'], '--tw-ring-color': currentPalette['accent-lilac'] + '70' }}
        >
            <span className="text-2xl" style={{ color: currentPalette['text-sidebar-dark'] }}>
              {showSidebar ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
                  </svg>
              )}
            </span>
        </button>
        <div className="flex-1 flex flex-col items-center">
            <h2 className={`font-bold mb-10 mt-4 transition-all duration-300 ${showSidebar ? 'text-2xl' : 'text-lg'}`} style={{ color: currentPalette['text-sidebar-dark'] }}>
                {showSidebar ? 'Admin Panel' : 'Adm'}
            </h2>
            <ul className="space-y-3 w-full">
              <SidebarLink tabName="home" icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
              } text="Home" />
              <SidebarLink tabName="course" icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-text">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h6z"/><path d="M10 12H7"/><path d="M10 16H7"/>
                  </svg>
              } text="Course Manager" />
              <SidebarLink tabName="batch" icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                  </svg>
              } text="Batch Manager" />
              <SidebarLink tabName="role" icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
              } text="Role Manager" />
            </ul>
        </div>
        <motion.button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center gap-2 hover:opacity-80 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 mt-auto"
            style={{ color: currentPalette['text-sidebar-dark'], '--tw-ring-color': currentPalette['accent-lilac'] + '70' }}
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className={`${showSidebar ? 'mr-3 text-xl' : 'text-3xl'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/>
                </svg>
            </span>
            {showSidebar && <span className="font-medium whitespace-nowrap">Logout</span>}
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto flex flex-col items-center z-10 p-4">
        {/* Header */}
        <header 
            className="flex items-center justify-between p-4 rounded-xl w-full max-w-5xl mb-8 shadow-md"
            style={{ 
                backgroundColor: currentPalette['bg-secondary'],
                boxShadow: `0 4px 15px ${currentPalette['shadow-light']}`
            }}
        >
            <h1 className="text-xl font-bold uppercase" style={{ color: currentPalette['text-dark'] }}>{activeTab}</h1>
            <div className="flex items-center gap-4">
                {/* Dark mode toggle - placed at the bottom right of the main content area */}
                {/* To ensure it stays absolutely positioned relative to the main content area */}
                <div className="fixed bottom-6 right-6 z-30"> 
                    <button
                        onClick={() => setDarkMode(prev => !prev)}
                        className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                            backgroundColor: darkMode ? currentPalette['accent-purple'] : currentPalette['accent-lilac'],
                            color: 'white',
                            boxShadow: darkMode ? `0 4px 15px ${currentPalette['accent-purple']}60` : `0 4px 15px ${currentPalette['accent-lilac']}60`,
                            '--tw-ring-color': darkMode ? currentPalette['accent-purple'] + '70' : currentPalette['accent-lilac'] + '70'
                        }}
                    >
                        <span className="w-6 h-6">
                            {darkMode ? (
                                // Sun icon for light mode (when dark mode is active)
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucude-sun">
                                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>
                                </svg>
                            ) : (
                                // Moon icon for dark mode (when light mode is active)
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                                </svg>
                            )}
                        </span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-2xl" style={{ color: currentPalette['text-muted'] }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                     </span>
                     <div>
                        <p className="font-semibold text-sm" style={{ color: currentPalette['text-dark'] }}>{profileData.name}</p>
                        <p className="text-xs" style={{ color: currentPalette['text-muted'] }}>{profileData.role}</p>
                     </div>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex justify-center items-start w-full max-w-5xl pb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab} // Key is crucial for AnimatePresence to detect changes
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full" // Ensure it takes full width within the container
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// A placeholder for a simple Login component if the user navigates to '/'
const LoginComponent = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const currentPalette = getColors(darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // In a real app, this would involve authentication logic
    // For demonstration, simulate a login if a token already exists
    if (localStorage.getItem('token')) {
      navigate('/admin'); // Assuming '/admin' is the dashboard route
    }
  }, [navigate, darkMode]);

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: currentPalette['bg-primary'] }}>
      <div className="fixed bottom-6 right-6 z-20"> {/* Dark mode toggle moved here */}
          <button
              onClick={() => setDarkMode(prev => !prev)}
              className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                  backgroundColor: darkMode ? currentPalette['accent-purple'] : currentPalette['accent-lilac'],
                  color: 'white',
                  boxShadow: darkMode ? `0 4px 15px ${currentPalette['accent-purple']}60` : `0 4px 15px ${currentPalette['accent-lilac']}60`,
                  '--tw-ring-color': darkMode ? currentPalette['accent-purple'] + '70' : currentPalette['accent-lilac'] + '70'
              }}
          >
              <span className="w-6 h-6">
                  {darkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucude-sun">
                        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>
                      </svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                      </svg>
                  )}
              </span>
          </button>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-8 rounded-2xl shadow-lg text-center w-96"
        style={{ 
            backgroundColor: currentPalette['bg-secondary'],
            boxShadow: `0 10px 40px ${currentPalette['shadow-medium']}`
        }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: currentPalette['text-dark'] }}>Admin Login</h2>
        <p className="text-base mb-6" style={{ color: currentPalette['text-muted'] }}>
          Enter your credentials to access the admin dashboard.
        </p>
        <input 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-2 mb-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition text-base font-sans"
            style={{
                borderColor: currentPalette['border-soft'],
                backgroundColor: currentPalette['bg-primary'],
                color: currentPalette['text-dark'],
                boxShadow: `0 2px 8px ${currentPalette['shadow-light']}`,
                '--tw-ring-color': currentPalette['accent-lilac'] + '70',
            }}
        />
        <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-2 mb-6 border-2 rounded-lg focus:outline-none focus:ring-2 transition text-base font-sans"
            style={{
                borderColor: currentPalette['border-soft'],
                backgroundColor: currentPalette['bg-primary'],
                color: currentPalette['text-dark'],
                boxShadow: `0 2px 8px ${currentPalette['shadow-light']}`,
                '--tw-ring-color': currentPalette['accent-lilac'] + '70',
            }}
        />
        <button
          onClick={() => {
            // Simulate token set on successful login
            localStorage.setItem('token', 'dummy-admin-token');
            navigate('/admin');
          }}
          className="w-full px-6 py-2 rounded-lg font-semibold shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: currentPalette['accent-purple'],
            color: 'white',
            boxShadow: `0 4px 15px ${currentPalette['accent-purple']}40`,
            '--tw-ring-color': currentPalette['accent-purple'] + '50',
          }}
        >
          Login
        </button>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
