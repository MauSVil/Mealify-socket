"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const mongodb_1 = require("mongodb");
let db = null;
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (db) {
        return db;
    }
    const uri = process.env.MONGO_URI || 'mongodb+srv://maudev96:root@develop.u8ux4sw.mongodb.net/?retryWrites=true&w=majority&appName=Develop';
    const client = new mongodb_1.MongoClient(uri);
    try {
        yield client.connect();
        db = client.db('test');
        console.log('Conectado a MongoDB');
        return db;
    }
    catch (err) {
        console.error('Error conectando a MongoDB:', err);
        throw new Error('Error conectando a MongoDB');
    }
});
exports.connectToDatabase = connectToDatabase;
