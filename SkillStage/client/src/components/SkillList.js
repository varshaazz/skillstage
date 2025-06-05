import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';

function SkillList() {
  const [skills, setSkills] = useState([]);
  const [userId, setUserId] = useState(null);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', category: '' });
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackData, setFeedbackData] = useState({});
  const [submittedFeedbackSkillIds, setSubmittedFeedbackSkillIds] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user.id || user._id)) {
      setUserId((user.id || user._id).toString());
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, []);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.userId || payload.id || payload._id || '').toString();
    } catch {
      return null;
    }
  };

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/skills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skillsData = res.data;
      const currentUserId = getUserIdFromToken();
      const updatedSkills = skillsData.map(skill => {
        const currentUserRequest = skill.requests.find(r => {
          const requesterId = typeof r.user === 'object' ? r.user._id?.toString() : r.user?.toString();
          return requesterId === currentUserId;
        });
        const requestStatus = currentUserRequest?.status || null;
        return { ...skill, requestStatus };
      });
      setSkills(updatedSkills);
    } catch (err) {
      console.error('Error fetching skills', err);
    }
  };

  const handleDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(prev => prev.filter(skill => skill._id !== skillId));
    } catch (error) {
      console.error('Error deleting skill', error);
    }
  };

  const handleEditClick = (skill) => {
    setEditingSkillId(skill._id);
    setEditFormData({
      title: skill.title,
      description: skill.description,
      category: skill.category,
    });
  };

  const handleEditChange = (e) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSave = async (skillId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/skills/${skillId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(skills.map(skill => (skill._id === skillId ? res.data : skill)));
      setEditingSkillId(null);
    } catch (error) {
      console.error('Error updating skill', error);
    }
  };

  const handleEditCancel = () => {
    setEditingSkillId(null);
  };

  const handleFeedbackChange = (skillId, field, value) => {
    setFeedbackData(prev => ({
      ...prev,
      [skillId]: { ...prev[skillId], [field]: value },
    }));
  };

  const handleSubmitFeedback = async (skillId) => {
  const token = localStorage.getItem('token');
  const raw = feedbackData[skillId] || {};
  const rating = Number(raw.rating);
  const comment = raw.comment;

  if (!rating || rating < 1 || rating > 5) {
    return alert('Please give a valid rating (1-5).');
  }

  console.log('Submitting feedback:', { rating, comment });

  try {
    await axios.post(
      `http://localhost:5000/api/skills/${skillId}/feedback`,
      { rating, comment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert('Feedback submitted!');
    setSubmittedFeedbackSkillIds(prev => [...prev, skillId]);
    fetchSkills();
  } catch (err) {
    console.error('Error submitting feedback:', err);
    alert('Failed to submit feedback. Check console for details.');
  }
};


  const handleRequest = async (skillId, isWithdraw) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in.');
    const url = `http://localhost:5000/api/skills/${skillId}/${isWithdraw ? 'withdraw' : 'request'}`;
    try {
      await axios.patch(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skillRes = await axios.get(`http://localhost:5000/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedSkill = skillRes.data;
      const currentUserId = getUserIdFromToken();
      const currentUserRequest = updatedSkill.requests.find(r => {
        const requesterId = typeof r.user === 'object' ? r.user._id?.toString() : r.user?.toString();
        return requesterId === currentUserId;
      });
      const requestStatus = currentUserRequest?.status || null;
      setSkills(prevSkills =>
        prevSkills.map(skill => (skill._id === skillId ? { ...updatedSkill, requestStatus } : skill))
      );
    } catch (err) {
      console.error('Request toggle failed:', err);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory =
      filterCategory === '' || skill.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch =
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const calculateAverageRating = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return null;
    const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-[#eef3f8] to-[#e2ecf4]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Available Skills</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Music">Music</option>
            <option value="Art">Art</option>
            <option value="Language">Language</option>
          </select>

          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {filteredSkills.length === 0 ? (
          <p className="text-center text-gray-500">No skills found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredSkills.map(skill => (
              <div
                key={skill._id}
                className="p-6 rounded-2xl shadow-md bg-white/50 backdrop-blur-md border border-white/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{skill.title}</h3>
                    <p className="text-sm text-gray-600">by {skill.owner._id?.toString() === userId ? 'You' : skill.owner.name}</p>
                  </div>

                  {skill.owner._id?.toString() === userId && (
                    <div className="flex gap-1">
                      <button onClick={() => handleEditClick(skill)} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(skill._id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-gray-700">{skill.description}</p>
                <p className="mt-1 text-sm text-blue-600 italic">Category: {skill.category}</p>

                {skill.feedbacks && skill.feedbacks.length > 0 && (
                  <p className="mt-2 text-yellow-600">⭐ Avg Rating: {calculateAverageRating(skill.feedbacks)} ({skill.feedbacks.length})</p>
                )}

                <div className="flex items-center mt-3 gap-2 flex-wrap">
                  {skill.owner._id?.toString() !== userId && (
                    <>
                      {skill.requestStatus === 'accepted' && <span className="text-green-600">✅ Request Accepted</span>}
                      {skill.requestStatus === 'rejected' && <span className="text-red-600">❌ Request Rejected</span>}
                      {skill.requestStatus === 'pending' && (
                        <button
                          onClick={() => handleRequest(skill._id, true)}
                          className="text-sm px-3 py-1 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          Withdraw Request
                        </button>
                      )}
                      {!skill.requestStatus && (
                        <button
                          onClick={() => handleRequest(skill._id, false)}
                          className="text-sm px-3 py-1 border border-blue-500 rounded-md text-blue-700 hover:bg-blue-100"
                        >
                          Request to Learn
                        </button>
                      )}
                    </>
                  )}
                </div>

                {skill.owner._id?.toString() !== userId &&skill.requestStatus === 'accepted' &&!skill.feedbacks.some(fb => fb.user === userId) && (
                  <div className="mt-4 space-y-2">
                    <label className="block">
                      <span className="text-sm text-gray-700">Rating:</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={feedbackData[skill._id]?.rating || ''}
                        onChange={e => handleFeedbackChange(skill._id, 'rating', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md"
                      />
                    </label>
                    <textarea
                      placeholder="Optional comment"
                      value={feedbackData[skill._id]?.comment || ''}
                      onChange={e => handleFeedbackChange(skill._id, 'comment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => handleSubmitFeedback(skill._id)}
                      className="text-white bg-blue-500 px-4 py-1 rounded-md hover:bg-blue-600"
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillList;
