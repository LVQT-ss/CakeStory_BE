
import shop from './shop.model.js';
import User from './User.model.js';


function setupAssociations() {
    User.hasOne(shop, {
        foreignKey: 'user_id',
        as: 'shop'
    });

    shop.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });
}

export default setupAssociations;