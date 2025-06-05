import React, { useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MyRequest from './components/MyRequest';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import Profile from './components/Profile';
import SkillList from './components/SkillList';
import SkillForm from './components/SkillForm';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { AuthContext } from './contexts/AuthContext';
import './App.css';

import { Sparkles, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

function Home() {
 return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-24 bg-gradient-to-br from-blue-100 to-purple-100 px-4 text-center">

      
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-4 drop-shadow-lg"
      >
        Welcome to SkillStage
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-lg md:text-xl text-gray-700 max-w-xl mb-6"
      >
        🌟 A platform to <span className="text-blue-600 font-semibold">share</span>, <span className="text-purple-600 font-semibold">learn</span>, and <span className="text-green-600 font-semibold">grow</span> your skills with an open community.
      </motion.p>

      {/* Feature Cards */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-xl rounded-2xl px-6 py-5 w-72"
        >
          <Sparkles className="text-purple-600 mb-2 mx-auto" size={32} />
          <h3 className="text-xl font-bold text-blue-700">Discover Talents</h3>
          <p className="text-sm text-gray-600">Browse skills shared by passionate individuals.</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-xl rounded-2xl px-6 py-5 w-72"
        >
          <Users className="text-blue-600 mb-2 mx-auto" size={32} />
          <h3 className="text-xl font-bold text-purple-700">Connect & Collaborate</h3>
          <p className="text-sm text-gray-600">Request to learn from others or offer your skills.</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-xl rounded-2xl px-6 py-5 w-72"
        >
          <Star className="text-yellow-500 mb-2 mx-auto" size={32} />
          <h3 className="text-xl font-bold text-green-700">Earn Feedback</h3>
          <p className="text-sm text-gray-600">Grow your credibility through community feedback.</p>
        </motion.div>
      </div>

      {/* Call to Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Sign Up Button: More prominent */}
        <Link to="/signup">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition transform hover:scale-105 animate-pulse">
            🚀 Join Now - It’s Free!
          </button>
        </Link>

        {/* Login Button: Subtle */}
        <Link to="/login">
          <button className="bg-white text-blue-700 border border-blue-400 hover:bg-blue-50 px-8 py-3 rounded-xl text-lg transition font-medium shadow">
            Already a Member? Log In
          </button>
        </Link>
      </motion.div>

      {/* Footer Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 text-sm text-gray-600 italic"
      >
        "Empower. Exchange. Excel."
      </motion.p>
    </div>
  );
}


function App() {
  const { user, loading } = useContext(AuthContext);
  console.log('User:', user);
  console.log('Loading:', loading);

  if (loading) return null; // Or replace with a loader spinner

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/skills" element={<PrivateRoute><SkillList /></PrivateRoute>} />
        <Route path="/add-skill" element={<PrivateRoute><SkillForm /></PrivateRoute>} />
        <Route path="/my-requests" element={<PrivateRoute><MyRequest /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default App;
