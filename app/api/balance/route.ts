import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'asc' },
    });

    let balance = 0;
    transactions.forEach((t) => {
      if (t.type === "SET_BALANCE") {
        balance = t.amount;
      } else if (t.type === "ADD_BALANCE") {
        balance += t.amount;
      } else if (t.type === "ADD_SPENDING") {
        balance -= t.amount;
      } else if (t.type === "SAVE_TO_SAVINGS") {
        balance -= t.amount;
      } else if (t.type === "TAKE_FROM_SAVINGS") {
        balance += t.amount;
      }
    });

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}

