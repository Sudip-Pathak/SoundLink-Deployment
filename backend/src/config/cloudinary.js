import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = () => {
    const name = process.env.CLOUDINARY_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_SECRET_KEY;

    if (!name || !key || !secret) {
        console.error('❌ Cloudinary config MISSING:', {
            CLOUDINARY_NAME: name ? '✅ set' : '❌ MISSING',
            CLOUDINARY_API_KEY: key ? '✅ set' : '❌ MISSING',
            CLOUDINARY_SECRET_KEY: secret ? '✅ set' : '❌ MISSING',
        });
    } else {
        console.log('✅ Cloudinary configured for cloud:', name);
    }

    cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: secret,
    });
};

export default connectCloudinary;
