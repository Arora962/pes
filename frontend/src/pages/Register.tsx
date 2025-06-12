import { useState } from 'react';

const menuItems = [
  'Dashboard',
  'Courses',
  'Peer Evaluation',
  'View Marks',
  'Raise Ticket',
  'Profile',
  'Logout',
];

const StudentDashboard = () => {
  const [selectedItem, setSelectedItem] = useState('Dashboard');

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Student Dashboard</h2>
        <ul className="menu">
          {menuItems.map((item) => (
            <li
              key={item}
              className={selectedItem === item ? 'active' : ''}
              onClick={() => setSelectedItem(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <h1>{selectedItem}</h1>
        <p>Content for {selectedItem} will appear here.</p>
      </main>
    </div>
  );
};

export default StudentDashboard;
