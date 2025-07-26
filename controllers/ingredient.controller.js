import Ingredient from '../models/Ingredient.model.js';
import Shop from '../models/shop.model.js';

// Create Ingredient (cho shop)
export const createIngredient = async (req, res) => {
  try {
    const { name, price } = req.body;
    const user_id = req.userId;

    const shop = await Shop.findOne({ where: { user_id } });
    if (!shop) {
      return res.status(403).json({ message: 'Shop not found for current user' });
    }

    const ingredient = await Ingredient.create({
      shop_id: shop.shop_id,
      name,
      price
    });

    return res.status(201).json({
      message: 'Ingredient created successfully',
      ingredient
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating ingredient', error: error.message });
  }
};

