// frontend/src/components/student/ProfileSection.tsx
import { useEffect, useState } from 'react';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  // Add more fields if your backend returns them
}

const ProfileSection = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfile(null); // Ensure profile is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Tailwind equivalent colors and gradients
  const topBarGradient = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
  const headerGradient = 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
  const infoItemBg = 'rgba(102, 126, 234, 0.05)';
  const infoItemBorder = 'rgba(102, 126, 234, 0.1)';
  const boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
  const border = '1px solid rgba(0, 0, 0, 0.08)';


  if (loading) return (
    <div
      className="max-w-[500px] mx-auto my-10 bg-white p-10 rounded-2xl relative font-sans"
      style={{ boxShadow: boxShadow, border: border }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: topBarGradient }}></div>
      <p className="text-center text-gray-700 py-16 text-lg">Loading profile...</p>
    </div>
  );

  if (!profile) return (
    <div
      className="max-w-[500px] mx-auto my-10 bg-white p-10 rounded-2xl relative font-sans"
      style={{ boxShadow: boxShadow, border: border }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: topBarGradient }}></div>
      <p className="text-center text-red-600 py-16 text-lg">Failed to load profile</p>
    </div>
  );

  return (
    <div
      className="max-w-[500px] mx-auto my-10 bg-white p-10 rounded-2xl relative font-sans"
      style={{ boxShadow: boxShadow, border: border }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: topBarGradient }}></div>
      <h2
        className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent"
        style={{ background: headerGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        My Profile
      </h2>
      <div className="flex flex-col gap-5">
        <div
          className="flex items-center p-4 rounded-xl border"
          style={{ background: infoItemBg, borderColor: infoItemBorder }}
        >
          <span className="font-bold text-gray-900 min-w-[80px] mr-3">Name:</span>
          <span className="text-gray-700 flex-1">{profile.name}</span>
        </div>
        <div
          className="flex items-center p-4 rounded-xl border"
          style={{ background: infoItemBg, borderColor: infoItemBorder }}
        >
          <span className="font-bold text-gray-900 min-w-[80px] mr-3">Email:</span>
          <span className="text-gray-700 flex-1">{profile.email}</span>
        </div>
        <div
          className="flex items-center p-4 rounded-xl border"
          style={{ background: infoItemBg, borderColor: infoItemBorder }}
        >
          <span className="font-bold text-gray-900 min-w-[80px] mr-3">User ID:</span>
          <span className="text-gray-700 flex-1">{profile.id}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;