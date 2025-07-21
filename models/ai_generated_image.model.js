import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";

const AiGeneratedImage = sequelize.define('AiGeneratedImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    prompt: { type: DataTypes.TEXT, allowNull: false },
    image_url: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'ai_generated_image',
    timestamps: false,
    underscored: true
});
export default AiGeneratedImage;