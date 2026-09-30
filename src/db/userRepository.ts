import { Schema, Repository } from 'redis-om'
import { createClient } from 'redis'

const redis = createClient()
redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect()

const userSchema = new Schema('user', {
  username: { type: 'string' },
  password: { type: 'string' }
});

export const userRepository = new Repository(userSchema, redis);

await userRepository.createIndex();
