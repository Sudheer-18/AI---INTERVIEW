import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import Welcome from './pages/Welcome';
import Interview from './pages/Interview';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <InterviewProvider>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </InterviewProvider>
    </Router>
  );
}

export default App;