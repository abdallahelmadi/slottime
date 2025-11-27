// app/api/cron/cleanup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    const prisma = new PrismaClient();
    
    // Get current date and time in Italy timezone
    const now = new Date();
    const italyTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Rome',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    const [currentDate, currentTime] = italyTime.split(', ');
    
    // Get all todos
    const todos = await prisma.todo.findMany();
    
    // Filter and delete expired todos
    const deletedIds = [];
    for (const todo of todos) {
      // Check if todo date is before today, or if it's today and end time has passed
      if (todo.date < currentDate || (todo.date === currentDate && todo.endTime <= currentTime)) {
        await prisma.todo.delete({
          where: { id: todo.id }
        });
        deletedIds.push(todo.id);
      }
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedIds.length,
      deletedIds,
      currentDate,
      currentTime
    });
  } catch (error) {
    console.error('Error cleaning up todos:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
