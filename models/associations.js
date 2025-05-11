
import BakerProfile from './BakerProfile.model.js';
import User from './User.model.js';


function setupAssociations() {
    User.hasOne(BakerProfile, {
        foreignKey: 'user_id',
        as: 'bakerProfile'
    });

    BakerProfile.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });
}

export default setupAssociations;