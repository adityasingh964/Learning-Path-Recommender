
import React, { useState, useEffect } from 'react';
import { AppView, Course, StudentProfile, LearningPath } from './types';
import { SAMPLE_CATALOG, INITIAL_PROFILE } from './constants';
import { generateLearningPath, getAdvisorAdvice } from './services/geminiService';
import Sidebar from './components/Sidebar';
import CourseCard from './components/CourseCard';
import RoadmapNode from './components/RoadmapNode';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('setup');
  const [catalog, setCatalog] = useState<Course[]>(SAMPLE_CATALOG);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleGeneratePath = async () => {
    setIsGenerating(true);
    setView('path');
    try {
      const result = await generateLearningPath(catalog, profile);
      setLearningPath(result);
    } catch (error) {
      alert("Error generating path: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskAdvisor = async () => {
    if (!chatInput.trim() || !learningPath) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAsking(true);
    try {
      const response = await getAdvisorAdvice(learningPath, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const chartData = [
    { name: 'Completed', value: profile.totalCreditsEarned },
    { name: 'Planned', value: learningPath ? learningPath.steps.reduce((acc, s) => acc + s.courses.reduce((sum, c) => sum + (c.credits || 0), 0), 0) : 0 },
    { name: 'Remaining', value: Math.max(0, 120 - profile.totalCreditsEarned - (learningPath ? learningPath.steps.reduce((acc, s) => acc + s.courses.reduce((sum, c) => sum + (c.credits || 0), 0), 0) : 0)) }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar currentView={view} setView={setView} />

      <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black uppercase tracking-wider">Academic Agent</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {view === 'setup' && 'Course Catalog'}
              {view === 'profile' && 'Student Profile'}
              {view === 'path' && 'Learning Roadmap'}
              {view === 'advisor' && 'AI Academic Advisor'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {view === 'setup' && 'Manage the curriculum and available academic resources.'}
              {view === 'profile' && 'Your academic identity, progress, and career aspirations.'}
              {view === 'path' && 'A visual journey towards your professional goals.'}
              {view === 'advisor' && 'Interactive support for your educational journey.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {view === 'path' && (
                <button 
                  onClick={() => window.print()}
                  className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-sm shadow-sm"
                >
                  Download PDF
                </button>
             )}
             <button 
                onClick={handleGeneratePath}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <span>✨</span> {learningPath ? 'Regenerate Path' : 'Generate Roadmap'}
              </button>
          </div>
        </header>

        {/* View Content */}
        {view === 'setup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                status={profile.completedCourses.includes(course.code) ? 'completed' : 'available'} 
              />
            ))}
            <div className="border-4 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 cursor-pointer transition-all bg-white/50">
              <span className="text-5xl mb-3">⊕</span>
              <span className="font-black uppercase tracking-widest text-sm">Add New Course</span>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-2xl font-black mb-8 text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">👤</span>
                Academic Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Student Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Major</label>
                  <input 
                    type="text" 
                    value={profile.major} 
                    onChange={e => setProfile({...profile, major: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Career Objective</label>
                  <input 
                    type="text" 
                    value={profile.careerGoal} 
                    onChange={e => setProfile({...profile, careerGoal: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Credits</label>
                  <input 
                    type="number" 
                    value={profile.totalCreditsEarned} 
                    onChange={e => setProfile({...profile, totalCreditsEarned: parseInt(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current GPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={profile.currentGPA} 
                    onChange={e => setProfile({...profile, currentGPA: parseFloat(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-lg font-black mb-6 text-slate-900 uppercase tracking-tight">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map(interest => (
                    <span key={interest} className="px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-2 group hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all cursor-default">
                      {interest}
                      <button onClick={() => setProfile({...profile, interests: profile.interests.filter(i => i !== interest)})} className="opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </span>
                  ))}
                  <button className="px-3 py-2 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-xs font-bold hover:border-indigo-300 hover:text-indigo-400 transition-all">
                    + Add Field
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-lg font-black mb-6 text-slate-900 uppercase tracking-tight">Degree Completion</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: '#f8fafc', radius: 12}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'path' && (
          <div className="pb-32">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mt-10 mb-2">Generating Vision...</h3>
                <p className="text-slate-500 font-medium">Synthesizing catalog requirements with your profile goals.</p>
              </div>
            ) : learningPath ? (
              <div className="max-w-6xl mx-auto">
                {/* Roadmap Header Summary */}
                <div className="bg-slate-900 text-white p-12 rounded-[40px] mb-20 relative overflow-hidden shadow-2xl shadow-indigo-200">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                      <span className="px-3 py-1 bg-indigo-500 text-xs font-black uppercase tracking-[0.2em] rounded-md mb-6 inline-block">Strategy Guide</span>
                      <h3 className="text-3xl font-black mb-6 leading-tight">Master Plan for {profile.careerGoal}</h3>
                      <p className="text-indigo-100/80 text-lg leading-relaxed font-medium">
                        {learningPath.overallStrategy}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center gap-6 lg:pl-12 lg:border-l lg:border-white/10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">⏱️</div>
                        <div>
                          <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-1">Timeline</p>
                          <p className="text-2xl font-bold">{learningPath.estimatedTimeToCompletion}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">🎯</div>
                        <div>
                          <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-1">Focus Area</p>
                          <p className="text-2xl font-bold">{learningPath.major}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Roadmap Nodes */}
                <div className="flex flex-col items-center">
                  {learningPath.steps.map((step, idx) => (
                    <RoadmapNode 
                      key={idx} 
                      step={step} 
                      index={idx} 
                      isLast={idx === learningPath.steps.length - 1} 
                    />
                  ))}
                  
                  {/* Graduation Milestone */}
                  <div className="flex flex-col items-center mt-10">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-emerald-200 border-8 border-emerald-50 scale-125">
                      🎓
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 mt-8">Goal Achieved</h4>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">{profile.careerGoal}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-6xl mb-10">🗺️</div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Ready to Begin?</h3>
                <p className="text-slate-500 font-medium mb-12 text-center max-w-sm">
                  Click the button below to generate a roadmap.sh-style visual path for your degree.
                </p>
                <button 
                  onClick={handleGeneratePath}
                  className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95"
                >
                  Architect Roadmap
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'advisor' && (
          <div className="max-w-4xl mx-auto h-[calc(100vh-280px)] flex flex-col bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-8">
              {chatHistory.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                    🤖
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Meet Lumina</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    I'm your dedicated academic AI. Ask me about your roadmap, prerequisites, or career alignment.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {['Is this too many credits?', 'What order should I take these?', 'Alternative career paths?'].map(q => (
                      <button 
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-8 py-5 rounded-3xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-medium' 
                      : 'bg-slate-50 border border-slate-100 text-slate-800 font-medium leading-relaxed'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 px-8 py-5 rounded-3xl">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <input 
                type="text"
                placeholder="Ask your advisor about your personalized roadmap..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()}
                className="w-full pl-8 pr-24 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all font-semibold"
              />
              <button 
                onClick={handleAskAdvisor}
                disabled={isAsking || !learningPath}
                className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-lg shadow-indigo-100"
              >
                Query AI
              </button>
            </div>
            {!learningPath && (
              <p className="text-center text-[10px] text-amber-600 mt-4 font-black uppercase tracking-widest">
                ⚠️ System requires an active Roadmap for personalized guidance
              </p>
            )}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default App;
