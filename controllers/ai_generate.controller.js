import { storage } from '../utils/firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AiGeneratedImage from '../models/ai_generated_image.model.js';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.userId; // From auth middleware

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Add prefix to the prompt
        const styledPrompt = `Close-up, eye-level shot of a cake on a stand, with soft, even lighting and a simple, blurred background. The focus is on the cake's presentation, highlighting its details elegantly of ${prompt}`;

        // Generate image using OpenAI
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: styledPrompt,
            n: 1,
            size: "1024x1024",
        });

        // Get the image URL from OpenAI response
        const imageUrl = response.data[0].url;

        // Download the image from OpenAI
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageResponse.data);

        // Generate unique filename with user's folder
        const filename = `ai_generated/${userId}/${Date.now()}.png`;

        // Upload to Firebase Storage with metadata
        const storageRef = ref(storage, filename);
        const metadata = {
            contentType: 'image/png',
            customMetadata: {
                userId: userId.toString(),
                prompt: prompt
            }
        };

        await uploadBytes(storageRef, buffer, metadata);

        // Get the Firebase Storage URL
        const firebaseUrl = await getDownloadURL(storageRef);

        // Save to database
        const savedImage = await AiGeneratedImage.create({
            user_id: userId,
            prompt: prompt,
            image_url: firebaseUrl,
        });

        res.status(200).json({
            message: 'Image generated successfully',
            data: savedImage
        });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            message: 'Error generating image',
            error: error.message
        });
    }
};

export const getUserGeneratedImages = async (req, res) => {
    try {
        const userId = req.userId;

        const images = await AiGeneratedImage.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Images retrieved successfully',
            data: images
        });

    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({
            message: 'Error fetching images',
            error: error.message
        });
    }
};
