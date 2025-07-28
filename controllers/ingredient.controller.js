import Ingredient from '../models/Ingredient.model.js';
import Shop from '../models/shop.model.js';

// Create Ingredient
export const createIngredient = async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    const user_id = req.userId;

    const shop = await Shop.findOne({ where: { user_id } });
    if (!shop) {
      return res.status(403).json({ message: 'Shop not found for current user' });
    }

    const ingredient = await Ingredient.create({
      shop_id: shop.shop_id,
      name,
      price,
      image,
      description
    });

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
    const { shop_id } = req.query;

    if (!shop_id) {
      return res.status(400).json({ message: 'shop_id is required' });
    }

    const ingredients = await Ingredient.findAll({
      where: {
        shop_id,
        is_active: true
      }
    });

    return res.status(200).json({ ingredients });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
  }
};

// Get ingredient by ID
export const getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_id } = req.query;

    if (!shop_id) {
      return res.status(400).json({ message: 'shop_id is required to fetch ingredient by id' });
    }

    const ingredient = await Ingredient.findOne({
      where: {
        id,
        shop_id,
        is_active: true
      }
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found for this shop' });
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
    const { name, price, image, description } = req.body;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient || !ingredient.is_active) {
      return res.status(404).json({ message: 'Ingredient not found or has been deleted' });
    }

    ingredient.name = name ?? ingredient.name;
    ingredient.price = price ?? ingredient.price;
    ingredient.image = image ?? ingredient.image;
    ingredient.description = description ?? ingredient.description;

    await ingredient.save();

    return res.status(200).json({ message: 'Ingredient updated', ingredient });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating ingredient', error: error.message });
  }
};

// Soft delete ingredient
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient || !ingredient.is_active) {
      return res.status(404).json({ message: 'Ingredient not found or already deleted' });
    }

    ingredient.is_active = false;
    await ingredient.save();

    return res.status(200).json({ message: 'Ingredient soft deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error soft deleting ingredient', error: error.message });
  }
};
