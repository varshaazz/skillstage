import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function AddSkillForm() {
  const [skill, setSkill] = useState({
    title: '',
    description: '',
    category: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setSkill({
      ...skill,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      'http://localhost:5000/api/skills',
      skill,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Skill added:', response.data);
    alert('Skill added successfully!');
    setSkill({ title: '', description: '', category: '' });
  } catch (error) {
    console.error('Error adding skill:', error.response?.data || error.message);
    alert('Error adding skill');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef3f8] to-[#e2ecf4] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/40 backdrop-blur-md shadow-md border border-white/30"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Add a New Skill</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Skill Title"
            value={skill.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/80 text-gray-800"
          />

          <select
            name="category"
            value={skill.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/80 text-gray-800"
          >
            <option value="">Select Category</option>
            <option value="Programming">Programming</option>
            <option value="Music">Music</option>
            <option value="Art">Art</option>
            <option value="Language">Language</option>
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={skill.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/80 text-gray-800"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition-colors duration-200"
          >
            Add Skill
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AddSkillForm;
