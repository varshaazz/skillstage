import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [postedSkills, setPostedSkills] = useState([]);
  const [requestedSkills, setRequestedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id;

      setUser({ id: userId, name: payload.name, email: payload.email });

      const postedRes = await axios.get('http://localhost:5000/api/skills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPostedSkills(postedRes.data.filter(s => s.owner._id === userId));

      const requestedRes = await axios.get('http://localhost:5000/api/skills/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestedSkills(requestedRes.data.sent || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEditClick = (skill) => {
    setEditingSkillId(skill._id);
    setEditFormData({ title: skill.title, description: skill.description, category: skill.category });
  };

  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleEditSave = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`http://localhost:5000/api/skills/${id}`, editFormData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPostedSkills(postedSkills.map(s => (s._id === id ? res.data : s)));
    setEditingSkillId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/skills/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPostedSkills(postedSkills.filter(s => s._id !== id));
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading profile...</div>;
  if (!user) return <div className="text-center mt-10 text-red-600">Please log in to view your profile.</div>;

  return (
    <>
      {/* Background blobs */}
      <style>{`
        .background {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
          overflow: hidden;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.6;
          animation: moveBlob 20s infinite alternate ease-in-out;
          mix-blend-mode: screen;
        }
        .blob1 {
          width: 320px;
          height: 320px;
          background: #ff6b6b;
          top: 10%;
          left: 15%;
          animation-delay: 0s;
        }
        .blob2 {
          width: 400px;
          height: 400px;
          background: #f8e71c;
          top: 50%;
          left: 65%;
          animation-delay: 8s;
        }
        .blob3 {
          width: 280px;
          height: 280px;
          background: #4cd137;
          top: 75%;
          left: 30%;
          animation-delay: 4s;
        }
        @keyframes moveBlob {
          0% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
          50% {
            transform: translate(40px, 20px);
            opacity: 0.4;
          }
          100% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
        }
      `}</style>

      <div className="background">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      {/* Main content container */}
      <div className="min-h-screen p-6 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-md bg-white/30 border border-white/40 p-6 rounded-xl shadow-lg mb-10">
            <h1 className="text-3xl font-bold text-center text-blue-900">Welcome</h1>
            <p className="text-center text-gray-700">{user.email}</p>
          </div>

          {/* Posted Skills */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Posted Skills</h2>
            <div className="space-y-4">
              {postedSkills.length === 0 ? (
                <p className="text-gray-600">No skills posted yet.</p>
              ) : (
                postedSkills.map(skill => (
                  <div key={skill._id} className="backdrop-blur-md bg-white/40 border border-white/30 p-4 rounded-lg shadow flex justify-between items-start">
                    {editingSkillId === skill._id ? (
                      <div className="w-full">
                        <input
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditChange}
                          className="w-full mb-2 px-3 py-2 border rounded bg-white/60"
                        />
                        <textarea
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditChange}
                          className="w-full mb-2 px-3 py-2 border rounded bg-white/60"
                          rows={2}
                        />
                        <input
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditChange}
                          className="w-full mb-2 px-3 py-2 border rounded bg-white/60"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSave(skill._id)} className="px-3 py-1 bg-green-500 text-white rounded">
                            Save
                          </button>
                          <button onClick={() => setEditingSkillId(null)} className="px-3 py-1 bg-gray-300 rounded">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{skill.title}</h3>
                          <p className="text-gray-700">{skill.description}</p>
                          <span className="text-sm text-gray-600">Category: {skill.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditClick(skill)} className="text-blue-600 hover:text-blue-800">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(skill._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Requested Skills */}
          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Requested Skills</h2>
            <div className="space-y-4">
              {requestedSkills.length === 0 ? (
                <p className="text-gray-600">You haven't requested any skills.</p>
              ) : (
                requestedSkills.map(skill => (
                  <div key={skill._id} className="backdrop-blur-md bg-white/40 border border-white/30 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800">{skill.title}</h3>
                    <p className="text-gray-700">{skill.description}</p>
                    <p className="text-sm text-gray-600">By {skill.owner.name}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
