import React, { useState } from 'react';
import './StudentDashboard.css';

const menuItems = [
  { label: 'Dashboard' },
  { label: 'Courses' },
  { label: 'Peer Evaluation' },
  { label: 'View Marks' },
  { label: 'Raise Ticket' },
  { label: 'Profile' },
  { label: 'Logout' },
];

export default function StudentDashboard() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="cards-grid">
            <div className="card">
              <h3>Upcoming Assignments</h3>
              <p>You have 3 assignments due this week.</p>
            </div>
            <div className="card">
              <h3>Recent Grades</h3>
              <p>AI & ML: 89 | Web Dev: 92 | DSA: 85</p>
            </div>
            <div className="card">
              <h3>Announcements</h3>
              <p>Peer review deadline extended to Friday.</p>
            </div>
          </div>
        );
      case 'Courses':
        return (
          <div className="cards-grid">
            <div className="card">
              <h3>AI & Machine Learning</h3>
              <p>Next Assignment Due: 14th June</p>
              <button className="btn">Submit Answers</button>
            </div>
            <div className="card">
              <h3>Web Development</h3>
              <p>Project phase 2 submission open</p>
              <button className="btn">Submit Answers</button>
            </div>
            <div className="card">
              <h3>Data Structures</h3>
              <p>Quiz scheduled for Monday</p>
              <button className="btn">Submit Answers</button>
            </div>
          </div>
        );
      case 'Peer Evaluation':
        return (
          <div className="card">
            <h2>Peer Evaluation</h2>
            <p>You have 2 peer reviews pending.</p>
            <button className="btn">Start Evaluation</button>
          </div>
        );
      case 'View Marks':
        return (
          <div className="card">
            <h2>Marks Overview</h2>
            <ul>
              <li>AI & ML - 89/100</li>
              <li>Web Dev - 92/100</li>
              <li>DSA - 85/100</li>
            </ul>
          </div>
        );
      case 'Raise Ticket':
        return (
          <div className="card">
            <h2>Raise a Ticket</h2>
            <textarea placeholder="Describe your issue..." rows={4}></textarea>
            <br />
            <button className="btn">Submit Ticket</button>
          </div>
        );
      case 'Profile':
        return (
          <div className="card">
            <h2>Your Profile</h2>
            <p>Name: Jahnavi</p>
            <p>Roll No: 21AIML1234</p>
            <p>Branch: AIML</p>
          </div>
        );
      case 'Logout':
        return (
          <div className="card">
            <h2>Are you sure you want to logout?</h2>
            <button className="btn">Confirm Logout</button>
          </div>
        );
      default:
        return <div>Select a menu option</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-title">Student</h2>
        <ul className="menu">
          {menuItems.map(({ label }) => (
            <li
              key={label}
              className={label === activeMenu ? 'active' : ''}
              onClick={() => setActiveMenu(label)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}
