import Ingredient from '../models/Ingredient.model.js';

// Create Ingredient
export const createIngredient = async (req, res) => {
  try {
    const { marketplace_post_id, name, price } = req.body;

    const ingredient = await Ingredient.create({ marketplace_post_id, name, price });

    return res.status(201).json({
      message: 'Ingredient created successfully',
      ingredient
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating ingredient', error: error.message });
  }
};

// Get all ingredients
export const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    return res.status(200).json({ ingredients });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
  }
};

// Get ingredient by ID
export const getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByPk(id);

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    return res.status(200).json({ ingredient });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching ingredient', error: error.message });
  }
};

// Update ingredient
export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    ingredient.name = name || ingredient.name;
    ingredient.price = price || ingredient.price;

    await ingredient.save();

    return res.status(200).json({ message: 'Ingredient updated', ingredient });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating ingredient', error: error.message });
  }
};

// Delete ingredient
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByPk(id);

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    await ingredient.destroy();

    return res.status(200).json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting ingredient', error: error.message });
  }
};