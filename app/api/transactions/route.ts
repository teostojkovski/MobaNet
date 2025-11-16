import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, amount, date } = body;

    if (!type || !title || amount === undefined) {
      return NextResponse.json(
        { error: 'Type, title, and amount are required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        title,
        description: description || null,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

