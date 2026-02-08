
import React, { useState, useEffect } from 'react';
import { UserRole as RoleEnum, Student as StudentType, Mentor as MentorType, Group } from './types';
import { MOCK_GROUP as GROUP_DATA, MOCK_MENTOR as MENTOR_DATA, MOCK_STUDENTS as STUDENTS_DATA, MENTOR_REGISTRATION_CODE } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import MentorView from './components/MentorView';
import LandingPage from './components/LandingPage';
import Shop from './components/Shop';
import Settings from './components/Settings';

function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<RoleEnum>(RoleEnum.STUDENT);
  
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  
  // App Data State
  const [students, setStudents] = useState<StudentType[]>(STUDENTS_DATA);
  const [mentors, setMentors] = useState<MentorType[]>([MENTOR_DATA]);
  const [groups, setGroups] = useState<Group[]>([GROUP_DATA]); 

  // Helper: Get Current Mentor
  const [currentMentor, setCurrentMentor] = useState<MentorType>(MENTOR_DATA);
  const [currentUserIdx, setCurrentUserIdx] = useState(0); // Which student is logged in

  // --- SIMULATED STREAK CHECK ---
  useEffect(() => {
    const runMidnightStreakCheck = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStudents(prevStudents => {
        return prevStudents.map(student => {
          const hasFreeze = student.inventory?.some(i => i.type === 'STREAK_FREEZE' && i.count > 0);
          if (student.logs.length === 0) return { ...student, streak: 0 };

          const sortedLogs = [...student.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const lastLogDate = new Date(sortedLogs[0].date);
          lastLogDate.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(today.getTime() - lastLogDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            if (hasFreeze) {
                const newInventory = student.inventory.map(i => i.type === 'STREAK_FREEZE' ? { ...i, count: i.count - 1 } : i).filter(i => i.count > 0);
                return { ...student, inventory: newInventory };
            } else {
                return { ...student, streak: 0 };
            }
          }
          return student;
        });
      });
    };
    runMidnightStreakCheck();
  }, []);

  const handleUpdateStudent = (updatedStudent: StudentType) => {
    const newStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(newStudents);
  };
  
  const handleUpdateMentor = (updatedMentor: MentorType) => {
      if (currentMentor.id === updatedMentor.id) {
         setCurrentMentor(updatedMentor);
      }
      setMentors(prev => prev.map(m => m.id === updatedMentor.id ? updatedMentor : m));
  };
  
  const handleUpdateGroupCode = (newCode: string) => {
      const myGroupId = currentMentor.groupIds[0];
      setGroups(prev => prev.map(g => g.id === myGroupId ? { ...g, joinCode: newCode } : g));
  };

  const handleProfileUpdate = (user: StudentType | MentorType) => {
      if (userRole === RoleEnum.MENTOR) {
          handleUpdateMentor(user as MentorType);
      } else {
          handleUpdateStudent(user as StudentType);
      }
  };

  const handleLogin = (role: RoleEnum, username?: string) => {
    if (role === RoleEnum.STUDENT && username) {
        const foundIdx = students.findIndex(s => s.username === username || s.name.toLowerCase().includes(username.toLowerCase()));
        if (foundIdx !== -1) setCurrentUserIdx(foundIdx);
        else setCurrentUserIdx(0);
    } 
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleRegister = async (name: string, username: string, code: string, role: RoleEnum): Promise<boolean> => {
      if (role === RoleEnum.MENTOR) {
          if (code !== MENTOR_REGISTRATION_CODE) return false;
          const newGroupId = `g-${Date.now()}`;
          const newGroupCode = `GRP${Math.floor(Math.random()*10000)}`;
          const newGroup: Group = {
              id: newGroupId,
              name: `${name}'in Grubu`,
              mentorId: `m-${Date.now()}`,
              joinCode: newGroupCode
          };
          const newMentor: MentorType = {
              id: newGroup.mentorId,
              name: name,
              username: username,
              role: RoleEnum.MENTOR,
              groupIds: [newGroupId]
          };
          setGroups(prev => [...prev, newGroup]);
          setMentors(prev => [...prev, newMentor]);
          setCurrentMentor(newMentor);
          setUserRole(RoleEnum.MENTOR);
          setIsLoggedIn(true);
          setCurrentView('dashboard');
          return true;
      }
      if (role === RoleEnum.STUDENT) {
          const targetGroup = groups.find(g => g.joinCode === code);
          if (!targetGroup) return false;
          const newStudent: StudentType = {
              id: `s-${Date.now()}`,
              name: name,
              username: username,
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
              role: RoleEnum.STUDENT,
              streak: 0,
              totalXp: 0,
              coins: 0,
              level: 1,
              groupId: targetGroup.id,
              badges: [],
              inventory: [],
              customTasks: [],
              logs: [],
              activeRewards: []
          };
          setStudents(prev => [...prev, newStudent]);
          setCurrentUserIdx(students.length);
          setUserRole(RoleEnum.STUDENT);
          setIsLoggedIn(true);
          setCurrentView('dashboard');
          return true;
      }
      return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(RoleEnum.STUDENT); 
  };

  const renderContent = () => {
    if (userRole === RoleEnum.MENTOR) {
        const myGroup = groups.find(g => g.id === currentMentor.groupIds[0]) || groups[0];
        const myStudents = students.filter(s => s.groupId === myGroup.id);
        if (currentView === 'settings') {
            return (
                <Settings 
                   currentUser={currentMentor}
                   role={userRole}
                   onUpdateProfile={handleProfileUpdate}
                   groupCode={myGroup.joinCode}
                   onUpdateGroupCode={handleUpdateGroupCode}
                   allStudents={myStudents}
                   onUpdateAllStudents={(updatedMyStudents) => {
                       setStudents(prev => prev.map(s => {
                           const updated = updatedMyStudents.find(us => us.id === s.id);
                           return updated || s;
                       }));
                   }}
                />
            );
        }
        return (
          <MentorView 
            view={currentView} 
            students={myStudents}
            onUpdateStudents={(updatedMyStudents) => {
                 setStudents(prev => prev.map(s => {
                     const updated = updatedMyStudents.find(us => us.id === s.id);
                     return updated || s;
                 }));
            }} 
            groupName={myGroup.name} 
            groupCode={myGroup.joinCode} 
          />
        );
    }

    const currentStudent = students[currentUserIdx] || students[0];
    switch (currentView) {
      case 'dashboard':
        return <Dashboard student={currentStudent} onUpdateStudent={handleUpdateStudent} />;
      case 'leaderboard':
        const groupStudents = students.filter(s => s.groupId === currentStudent.groupId);
        return <Leaderboard students={groupStudents} />;
      case 'market':
        return <Shop student={currentStudent} onUpdateStudent={handleUpdateStudent} />;
      case 'settings':
        return <Settings currentUser={currentStudent} role={userRole} onUpdateProfile={handleProfileUpdate} />;
      default:
        return <Dashboard student={currentStudent} onUpdateStudent={handleUpdateStudent} />;
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      <Sidebar currentUserRole={userRole} currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto h-screen relative bg-black md:bg-slate-50">
        <div className="absolute top-4 right-4 z-40 hidden md:block opacity-50 hover:opacity-100 transition-opacity">
            <div className="text-[10px] bg-slate-200 px-2 py-1 rounded text-slate-500 cursor-default uppercase font-bold">
                {userRole === RoleEnum.STUDENT ? 'Talebe' : 'Mentör'}
            </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
