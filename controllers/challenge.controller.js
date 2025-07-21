import { Op } from 'sequelize';
import Challenge from '../models/challenge.model.js';

// Create Challenge
export const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      prize_description
    } = req.body;

    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Validate time
    const minStartDate = new Date(now);
    minStartDate.setDate(minStartDate.getDate() + 7);

    if (startDate < minStartDate) {
      return res.status(400).json({ message: 'Start date must be at least 7 days after creation date.' });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    const challenge = await Challenge.create({
      title,
      description,
      start_date,
      end_date,
      prize_description,
      status: 'notStart',
      created_at: now
    });

    res.status(201).json({ message: 'Challenge created successfully', challenge });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get All Challenges
export const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: {
        status: {
          [Op.not]: 'unAvailable'
        }
      }
    });
    res.status(200).json({ challenges });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching challenges', error: err.message });
  }
};

