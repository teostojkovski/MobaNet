import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.incomeCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: 'Name and value are required' },
        { status: 400 }
      );
    }

    const category = await prisma.incomeCategory.create({
      data: {
        name,
        value: parseFloat(value),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating income category:', error);
    return NextResponse.json(
      { error: 'Failed to create income category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, value } = body;

    if (!id || !name || value === undefined) {
      return NextResponse.json(
        { error: 'ID, name, and value are required' },
        { status: 400 }
      );
    }

    const category = await prisma.incomeCategory.update({
      where: { id },
      data: {
        name,
        value: parseFloat(value),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating income category:', error);
    return NextResponse.json(
      { error: 'Failed to update income category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.incomeCategory.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income category:', error);
    return NextResponse.json(
      { error: 'Failed to delete income category' },
      { status: 500 }
    );
  }
}

