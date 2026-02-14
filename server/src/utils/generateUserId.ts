import { prisma } from '../database';

export async function generateUserId(): Promise<bigint> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT nextval('user_id_seq') as nextval
    `;
    
    if (!result || result.length === 0) {
      throw new Error('Failed to generate user ID: Empty result from sequence');
    }

    const val = result[0].nextval;
    return BigInt(val);
  } catch (error) {
    console.error('Error in generateUserId:', error);
    throw error;
  }
}
