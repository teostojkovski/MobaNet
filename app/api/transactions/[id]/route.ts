import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactionId = parseInt(id);
    
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
