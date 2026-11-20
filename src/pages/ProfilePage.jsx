import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  CheckCircle, 
  Sliders, 
  Shield, 
  Compass, 
  Check, 
  RotateCcw,
  BookOpen,
  MapPin,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

const ProfilePage = () => {
  const defaultProfile = {
    name: "Student Name",
    studentId: "2024-STU-001",
    department: "Computer Science & Engineering",
    course: "Bachelor of Technology (B.Tech)",
    academicYear: "2nd Year / Semester 4",
    campus: "Main University Campus",
    preferences: {
      accessibleRoutes: false,
      autoCenterMap: true,
      defaultStartPoint: "Main Foyer Entrance",
      voiceGuidance: false
    }
  };

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('unipath_user_profile');
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    studentId: profile.studentId,
    department: profile.department,
    course: profile.course,
    academicYear: profile.academicYear,
    campus: profile.campus || "Main University Campus"
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const startPoints = [
    "Main Foyer Entrance",
    "South Corridor Crossway",
    "Central Corridor Atrium",
    "North Corridor Crossway"
  ];

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: formData.name.trim() || defaultProfile.name,
      studentId: formData.studentId.trim() || defaultProfile.studentId,
      department: formData.department.trim() || defaultProfile.department,
      course: formData.course.trim() || defaultProfile.course,
      academicYear: formData.academicYear.trim() || defaultProfile.academicYear,
      campus: formData.campus.trim() || defaultProfile.campus
    };
    setProfile(updated);
    try {
      localStorage.setItem('unipath_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const togglePreference = (key) => {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key]
      }
    };
    setProfile(updated);
    try {
      localStorage.setItem('unipath_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const setStartPoint = (val) => {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        defaultStartPoint: val
      }
    };
    setProfile(updated);
    try {
      localStorage.setItem('unipath_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPreferences = () => {
    const updated = {
      ...profile,
      preferences: { ...defaultProfile.preferences }
    };
    setProfile(updated);
    try {
      localStorage.setItem('unipath_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F0E6] overflow-y-auto no-scrollbar pb-32">
      {/* Top Page Header */}
      <div className="bg-white border-b border-[#E5DED2] px-4 sm:px-6 lg:px-8 py-6 select-none shadow-subtle">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#123B46] flex items-center justify-center text-white shadow-xs">
                <User className="w-5 h-5 stroke-[2]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24313A] tracking-tight">
                Student Profile & Wayfinding Settings
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#78828A]">
              Manage university registration details and indoor campus navigation preferences.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="px-3.5 py-2 rounded-xl bg-[#E9F1F3] border border-[#1D5968]/30 text-[#1D5968] text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#1D5968]" />
              <span>DSA Navigation Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Saved Confirmation Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-[#E9F1F3] border border-[#1D5968]/30 text-[#1D5968] text-sm sm:text-base font-semibold flex items-center space-x-2.5 shadow-subtle animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-[#1D5968] flex-shrink-0" />
            <span>Profile details updated successfully and stored in browser memory.</span>
          </div>
        )}

        {/* TWO-COLUMN DESKTOP GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (approx 40% on desktop: lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Student Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] p-6 shadow-subtle space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Large Avatar Placeholder */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E6D8C3]/30 border-2 border-[#123B4A]/15 flex items-center justify-center text-[#123B4A] shadow-sm flex-shrink-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.75]" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#24313A] truncate">
                      {profile.name}
                    </h2>
                    <p className="text-sm font-semibold text-[#1D5968] truncate">
                      {profile.course}
                    </p>
                    <p className="text-sm text-[#78828A]">
                      ID: <span className="font-mono font-bold text-[#24313A]">{profile.studentId}</span>
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setFormData({
                        name: profile.name,
                        studentId: profile.studentId,
                        department: profile.department,
                        course: profile.course,
                        academicYear: profile.academicYear,
                        campus: profile.campus || "Main University Campus"
                      });
                      setIsEditing(true);
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#E5DED2] hover:bg-[#F5F0E6] text-[#24313A] text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 shadow-sm flex-shrink-0"
                    type="button"
                    title="Edit Profile Details"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>

              {/* Status Pills */}
              <div className="pt-2 border-t border-[#E5DED2]/80 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F0E6] text-[#24313A] font-medium border border-[#E5DED2]">
                  Status: <strong className="text-[#1D5968]">Enrolled</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F0E6] text-[#78828A] border border-[#E5DED2]">
                  {profile.academicYear}
                </span>
              </div>
            </div>

            {/* In-line Edit Form (When Active) */}
            {isEditing && (
              <form onSubmit={handleSave} className="bg-white rounded-2xl border-2 border-[#1D5968] p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
                  <h3 className="text-sm font-bold text-[#24313A] flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-[#1D5968]" />
                    <span>Edit Profile Details</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-[#78828A] hover:text-[#24313A]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-[#24313A] block mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] text-[#24313A] font-medium focus:ring-2 focus:ring-[#1D5968] focus:outline-none"
                      placeholder="e.g. Student Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24313A] block mb-1">Student Roll Number / Registration ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] text-[#24313A] font-medium focus:ring-2 focus:ring-[#1D5968] focus:outline-none"
                      placeholder="e.g. 2024-STU-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24313A] block mb-1">Academic Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] text-[#24313A] font-medium focus:ring-2 focus:ring-[#1D5968] focus:outline-none"
                      placeholder="e.g. Computer Science & Engineering"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24313A] block mb-1">Degree / Course</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] text-[#24313A] font-medium focus:ring-2 focus:ring-[#1D5968] focus:outline-none"
                      placeholder="e.g. Bachelor of Technology (B.Tech)"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24313A] block mb-1">Academic Year / Semester</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] text-[#24313A] font-medium focus:ring-2 focus:ring-[#1D5968] focus:outline-none"
                      placeholder="e.g. 2nd Year / Semester 4"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#24313A] block mb-1">Campus Location</label>
                    <input
                      type="text"
                      value={formData.campus}
                      onChange={(e) => setFormData({...formData, campus: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-[#E5DED2] bg-[#FBF9F5] text-[#24313A] font-medium focus:ring-2 focus:ring-[#1D5968] focus:outline-none"
                      placeholder="e.g. Main University Campus"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E5DED2]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#E5DED2] text-[#78828A] hover:bg-[#F5F0E6] text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#123B4A] hover:bg-[#0E2E3A] text-white text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* Semester DSA Project Specifications Card */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-[#24313A] flex items-center space-x-2 border-b border-[#E5DED2] pb-2.5">
                <Cpu className="w-4 h-4 text-[#123B4A]" />
                <span>DSA Architecture Specifications</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#24313A]">Shortest Path Engine</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1D5968] text-white">Dijkstra</span>
                  </div>
                  <p className="text-[11px] text-[#78828A]">
                    Weighted adjacency graph algorithm with priority queue time complexity: O((V + E) log V).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#24313A]">Location Hash Index</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#123B4A] text-white">O(1)</span>
                  </div>
                  <p className="text-[11px] text-[#78828A]">
                    Constant time lookup dictionary indexed by unique location ID and room numbers.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#24313A]">Database Schema Ready</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#286D78] text-white">PostgreSQL</span>
                  </div>
                  <p className="text-[11px] text-[#78828A]">
                    Standardized data contract ready for PostgreSQL tables & FastAPI service endpoints.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (approx 60% on desktop: lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Academic Details Card */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
                <h3 className="text-base font-bold text-[#24313A] flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[#123B4A] stroke-[1.75]" />
                  <span>Academic Details & Registration</span>
                </h3>
                <span className="text-xs text-[#78828A]">University Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <span className="text-[#78828A] text-[11px] uppercase tracking-wider block font-semibold">
                    Department
                  </span>
                  <span className="font-bold text-[#24313A] text-sm block">
                    {profile.department}
                  </span>
                  <span className="text-[11px] text-[#78828A] block">Faculty of Information Technology</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <span className="text-[#78828A] text-[11px] uppercase tracking-wider block font-semibold">
                    Program of Study
                  </span>
                  <span className="font-bold text-[#24313A] text-sm block">
                    {profile.course}
                  </span>
                  <span className="text-[11px] text-[#78828A] block">Undergraduate Degree Program</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <span className="text-[#78828A] text-[11px] uppercase tracking-wider block font-semibold">
                    Academic Term
                  </span>
                  <span className="font-bold text-[#24313A] text-sm block">
                    {profile.academicYear}
                  </span>
                  <span className="text-[11px] text-[#78828A] block">Current Enrolled Semester</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1">
                  <span className="text-[#78828A] text-[11px] uppercase tracking-wider block font-semibold">
                    Student Registration ID
                  </span>
                  <span className="font-mono font-bold text-[#1D5968] text-sm block">
                    {profile.studentId}
                  </span>
                  <span className="text-[11px] text-[#78828A] block">Verified University ID</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#E5DED2]/80 space-y-1 sm:col-span-2">
                  <span className="text-[#78828A] text-[11px] uppercase tracking-wider block font-semibold">
                    Campus Zone
                  </span>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#286D78]" />
                    <span className="font-bold text-[#24313A] text-sm">
                      {profile.campus || "Main University Campus"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#78828A] block">Academic Blocks, CS Laboratories & Administrative Wings</span>
                </div>
              </div>
            </div>

            {/* Indoor Navigation Preferences Card */}
            <div className="bg-white rounded-2xl border border-[#E5DED2] p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-[#123B4A] stroke-[1.75]" />
                  <h3 className="text-base font-bold text-[#24313A]">
                    Indoor Navigation & Wayfinding Preferences
                  </h3>
                </div>
                <button
                  onClick={handleResetPreferences}
                  className="text-xs text-[#78828A] hover:text-[#24313A] flex items-center space-x-1"
                  type="button"
                  title="Reset to system defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Preference 1: Auto-Center Map */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5DED2] transition hover:bg-white">
                  <div className="pr-4 space-y-0.5">
                    <span className="font-bold text-[#24313A] block">
                      Auto-Center Map on Selected Room
                    </span>
                    <span className="text-xs text-[#78828A] block">
                      Automatically orient and center the indoor floor plan when selecting a room or classroom.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.autoCenterMap}
                    onChange={() => togglePreference('autoCenterMap')}
                    className="w-5 h-5 rounded accent-[#123B4A] cursor-pointer"
                  />
                </div>

                {/* Preference 2: Accessible Routes */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5DED2] transition hover:bg-white">
                  <div className="pr-4 space-y-0.5">
                    <span className="font-bold text-[#24313A] block">
                      Prioritize Accessible Routes (Elevators & Ramps)
                    </span>
                    <span className="text-xs text-[#78828A] block">
                      Bypass staircases and compute pathfinding using accessible elevator shafts and wide corridors.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.accessibleRoutes}
                    onChange={() => togglePreference('accessibleRoutes')}
                    className="w-5 h-5 rounded accent-[#123B4A] cursor-pointer"
                  />
                </div>

                {/* Preference 3: Default Starting Point */}
                <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5DED2] space-y-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#24313A] block">
                      Default Starting Campus Entrance
                    </span>
                    <span className="text-xs text-[#78828A] block">
                      Select your preferred entrance node for route calculations from the outside.
                    </span>
                  </div>

                  <select
                    value={profile.preferences.defaultStartPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-[#E5DED2] bg-white text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#1D5968]"
                  >
                    {startPoints.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preference 4: Simulated Audio Chime */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5DED2] transition hover:bg-white">
                  <div className="pr-4 space-y-0.5">
                    <span className="font-bold text-[#24313A] block">
                      Simulate Turn-by-Turn Arrival Guidance
                    </span>
                    <span className="text-xs text-[#78828A] block">
                      Provide haptic / visual prompts when reaching hallway junctions or destination doors.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.voiceGuidance}
                    onChange={() => togglePreference('voiceGuidance')}
                    className="w-5 h-5 rounded accent-[#123B4A] cursor-pointer"
                  />
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
