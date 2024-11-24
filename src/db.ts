import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;

export const connectToDatabase = async () => {
    if (db) {
        return db;
    }

    const uri = process.env.MONGO_URI || 'mongodb+srv://maudev96:root@develop.u8ux4sw.mongodb.net/?retryWrites=true&w=majority&appName=Develop';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        db = client.db('test');
        console.log('Conectado a MongoDB');
        return db;
    } catch (err) {
        console.error('Error conectando a MongoDB:', err);
        throw new Error('Error conectando a MongoDB');
    }
};
