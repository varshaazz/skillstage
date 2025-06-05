const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const User = require('../models/User');
const auth = require('../middleware/auth');

// -------------------------
// Create skill listing
// -------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const skill = new Skill({
      owner: req.user.id,
      title,
      description,
      category,
      requests: []
    });
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Get all skills
// -------------------------
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate('owner', 'name email')
      .populate('requests.user', 'name email');

    const skillsWithAverage = skills.map(skill => {
      const feedbacks = skill.feedbacks || [];
      const totalRatings = feedbacks.reduce((sum, f) => sum + f.rating, 0);
      const avgRating = feedbacks.length ? (totalRatings / feedbacks.length).toFixed(1) : null;

      return {
        ...skill.toObject(),
        averageRating: avgRating,
        totalRatings: feedbacks.length
      };
    });

    res.json(skillsWithAverage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Get sent and received requests
// -------------------------
router.get('/my-requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('User ID:', userId);

    const sent = await Skill.find({ 'requests.user': userId })
      .populate('owner', 'name email')
      .populate('requests.user', 'name email');
    console.log('Sent requests:', sent.length);

    const received = await Skill.find({
      owner: userId,
      requests: { $exists: true, $not: { $size: 0 } }
    }).populate('requests.user', 'name email');
    console.log('Received requests:', received.length);

    res.json({ sent, received });
  } catch (err) {
    console.error('Detailed error in /my-requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Get skill by ID
// -------------------------
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('requests.user', 'name email');

    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const feedbacks = skill.feedbacks || [];
    const totalRatings = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = feedbacks.length ? (totalRatings / feedbacks.length).toFixed(1) : null;

    res.json({
      ...skill.toObject(),
      averageRating: avgRating,
      totalRatings: feedbacks.length
    });
  } catch (err) {
    console.error('Error fetching skill by id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Update skill
// -------------------------
router.put('/:id', auth, async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    skill.title = title || skill.title;
    skill.description = description || skill.description;
    skill.category = category || skill.category;

    await skill.save();
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Delete skill
// -------------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    console.log('Skill owner:', skill.owner);
    console.log('Request user id:', req.user.id);

    if (skill.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    // Delete using Model method instead of instance method
    await Skill.findByIdAndDelete(req.params.id);

    res.json({ message: 'Skill deleted' });
  } catch (err) {
    console.error('Delete skill error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// -------------------------
// Toggle request
// -------------------------
router.patch('/:id/request', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const userId = req.user.id;
    if (skill.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot request your own skill' });
    }

    skill.requests = skill.requests.filter(r => r && r.user);
    const existingRequestIndex = skill.requests.findIndex(r => r.user.toString() === userId);

    if (existingRequestIndex !== -1) {
      skill.requests.splice(existingRequestIndex, 1);
      await skill.save();
      await skill.populate('requests.user', 'name email');
      return res.json({ message: 'Request withdrawn successfully', requests: skill.requests });
    } else {
      skill.requests.push({ user: userId, status: 'pending' });
      await skill.save();
      await skill.populate('requests.user', 'name email');
      return res.json({ message: 'Request sent successfully', requests: skill.requests });
    }
  } catch (error) {
    console.error('Error toggling request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Withdraw request
// -------------------------
router.patch('/:id/withdraw', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const userId = req.user.id;
    skill.requests = skill.requests.filter(r => r.user.toString() !== userId);
    await skill.save();

    res.json({ message: 'Withdrawn successfully', requests: skill.requests });
  } catch (err) {
    console.error('Error withdrawing request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Accept request
// -------------------------
router.patch('/:id/request/:requestId/accept', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('requests.user');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const request = skill.requests.find(r => r._id.toString() === req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'accepted';

    if (!skill.acceptedLearners.some(u => u.toString() === request.user._id.toString())) {
      skill.acceptedLearners.push(request.user._id);
    }

    await skill.save();
    res.json({ message: 'Request accepted', requests: skill.requests });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Reject request
// -------------------------
router.patch('/:id/request/:requestId/reject', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('requests.user');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const request = skill.requests.find(r => r._id.toString() === req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';

    if (!skill.acceptedLearners.some(u => u.toString() === request.user._id.toString())) {
      skill.acceptedLearners.push(request.user._id);
    }

    await skill.save();
    res.json({ message: 'Request rejected', requests: skill.requests });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// Submit feedback
// -------------------------
router.post('/:id/feedback', auth, async (req, res) => {
  const { rating, comment } = req.body;
  const skillId = req.params.id;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    const alreadyGiven = skill.feedbacks.find(f => f.user.toString() === userId);
    if (alreadyGiven) return res.status(400).json({ message: 'You have already left feedback.' });

    skill.feedbacks.push({ user: userId, comment: comment || '', rating });
    await skill.save();

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
