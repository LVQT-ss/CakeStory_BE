import Post from '../models/post.model.js';
import Album from '../models/album.model.js';
import AlbumPost from '../models/album_post.model.js';
import PostData from '../models/post_data.model.js';
import sequelize from '../database/db.js';

const createAlbum = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user_id = req.userId;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required'
            });
        }

        const album = await Album.create({
            user_id,
            name,
            description: description || null,
            created_at: new Date()
        });

        res.status(201).json({
            message: 'Album created successfully',
            album
        });

    } catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({
            message: 'Error creating album',
            error: error.message
        });
    }
}



export { createAlbum };