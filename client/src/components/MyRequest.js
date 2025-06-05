import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyRequest = () => {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchSkills = async () => {
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/skills/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSent(res.data.sent || []);
      setReceived(res.data.received || []);

      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId || payload.id);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAcceptRequest = async (skillId, requestId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/skills/${skillId}/request/${requestId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReceived(prev =>
        prev.map(skill =>
          skill._id === skillId
            ? {
                ...skill,
                requests: skill.requests.map(r =>
                  r._id === requestId ? { ...r, status: 'accepted' } : r
                ),
              }
            : skill
        )
      );
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleRejectRequest = async (skillId, requestId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/skills/${skillId}/request/${requestId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReceived(prev =>
        prev.map(skill =>
          skill._id === skillId
            ? {
                ...skill,
                requests: skill.requests.map(r =>
                  r._id === requestId ? { ...r, status: 'rejected' } : r
                ),
              }
            : skill
        )
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef3f8] to-[#e2ecf4]">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef3f8] to-[#e2ecf4] px-4 py-12 flex justify-center">
      <div className="max-w-4xl w-full bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30">
        <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">My Requests</h2>

        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b border-gray-300 pb-2">
            Outgoing Requests
          </h3>
          {sent.length === 0 ? (
            <p className="text-gray-600">You haven't requested to learn any skills yet.</p>
          ) : (
            <ul className="space-y-3">
              {sent.map(skill => (
                <li
                  key={skill._id}
                  className="bg-white/80 rounded-md p-4 shadow-sm border border-gray-200 text-gray-800"
                >
                  <strong>{skill.title}</strong> by {skill.owner?.name || skill.owner?.email}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b border-gray-300 pb-2">
            Incoming Requests
          </h3>
          {received.length === 0 ? (
            <p className="text-gray-600">No one has requested to learn your skills yet.</p>
          ) : (
            <ul className="space-y-6">
              {received.map(skill => (
                <li key={skill._id} className="bg-white/80 rounded-lg p-5 shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{skill.title}</h4>
                  {skill.requests.length > 0 ? (
                    <ul className="space-y-2">
                      {skill.requests.map(r => (
                        <li
                          key={r._id}
                          className="flex items-center justify-between bg-white/90 rounded-md px-4 py-2 border border-gray-300"
                        >
                          <span className="text-gray-700">
                            {r.user?.name || r.user?.email} —{' '}
                            <span
                              className={`font-semibold ${
                                r.status === 'accepted'
                                  ? 'text-green-600'
                                  : r.status === 'rejected'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              }`}
                            >
                              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </span>
                          </span>

                          {r.status === 'pending' && (
                            <div>
                              <button
                                onClick={() => handleAcceptRequest(skill._id, r._id)}
                                className="mr-2 px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(skill._id, r._id)}
                                className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 italic">No requests for this skill.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyRequest;
