import { prisma } from '../database';

export async function generateUserId(): Promise<bigint> {
  const result = await prisma.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('user_id_seq')
  `;
  return result[0].nextval;
}
