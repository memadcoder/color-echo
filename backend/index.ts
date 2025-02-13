import { RealtimeRelay } from './lib/socket.ts';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

if(!OPENAI_API_KEY) {
  console.error(
    `Environment variable "OPENAI_API_KEY" is required.\n` +
    `Please set it in your .env file.`
  );
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT || '7001', 10);

const socket = new RealtimeRelay(OPENAI_API_KEY);
socket.listen(PORT);