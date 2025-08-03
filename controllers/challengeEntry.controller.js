import ChallengeEntry from '../models/challenge_entry.model.js';
import Challenge from '../models/challenge.model.js';
import User from '../models/User.model.js';

// CREATE Challenge Entry
export const createChallengeEntry = async (req, res) => {
  try {
    const { challenge_id, user_id } = req.body;

    const challenge = await Challenge.findByPk(challenge_id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const currentCount = await ChallengeEntry.count({ where: { challenge_id } });
    if (challenge.max_participants !== null && currentCount >= challenge.max_participants) {
      return res.status(400).json({ message: 'Maximum participants reached for this challenge' });
    }

    const existingEntry = await ChallengeEntry.findOne({ where: { challenge_id, user_id } });
    if (existingEntry) {
      return res.status(400).json({ message: 'User already joined this challenge' });
    }

    const entry = await ChallengeEntry.create({ challenge_id, user_id });
    res.status(201).json({ message: 'Challenge entry created', entry });
  } catch (err) {
    res.status(500).json({ message: 'Error creating entry', error: err.message });
  }
};

// GET ALL entries with user
export const getAllChallengeEntries = async (req, res) => {
  try {
    const entries = await ChallengeEntry.findAll({
      include: {
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'avatar']
      }
    });
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entries', error: err.message });
  }
};

// GET by ID with user
export const getChallengeEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await ChallengeEntry.findByPk(id, {
      include: {
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'avatar']
      }
    });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json({ entry });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entry', error: err.message });
  }
};

// GET by Challenge ID with user
export const getChallengeEntriesByChallengeId = async (req, res) => {
  try {
    const { challenge_id } = req.params;
    const entries = await ChallengeEntry.findAll({
      where: { challenge_id },
      include: {
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'avatar']
      }
    });
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entries', error: err.message });
  }
};

// UPDATE
export const updateChallengeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { challenge_id, user_id } = req.body;

    const updated = await ChallengeEntry.update(
      { challenge_id, user_id },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Entry not found or no changes' });
    }

    const entry = await ChallengeEntry.findByPk(id, {
      include: {
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'avatar']
      }
    });
    res.status(200).json({ message: 'Entry updated', entry });
  } catch (err) {
    res.status(500).json({ message: 'Error updating entry', error: err.message });
  }
};

// DELETE
export const deleteChallengeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ChallengeEntry.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting entry', error: err.message });
  }
};
