/* eslint-disable no-var */
import _mongoose, { connect } from 'mongoose';

declare global {
	var mongoose: {
		promise: ReturnType<typeof connect> | null;
		conn: typeof _mongoose | null;
	};
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	const MONGODB_URI = process.env.MONGO_URI;
	if (!MONGODB_URI) {
		throw new Error('Please add your MongoDB URI to .env.local');
	}

	if (!cached.promise) {
		cached.promise = connect(MONGODB_URI, { bufferCommands: false })
			.then((mongoose) => mongoose)
			.catch((error) => {
				cached.promise = null;
				throw error;
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default connectDB;
