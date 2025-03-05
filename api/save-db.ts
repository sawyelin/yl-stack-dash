import { writeFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await req.arrayBuffer();
    const dbPath = join(process.cwd(), 'public', 'db', 'dashboard.sqlite');
    
    await writeFile(dbPath, Buffer.from(data));
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error saving database:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 