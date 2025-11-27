// app/api/todos/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function GET() {
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
  const allTodos = await prisma.todo.findMany({
    orderBy: { date: "asc" },
  });
  
  // Filter out expired todos (only return active ones)
  const activeTodos = allTodos.filter((todo: any) => {
    // Keep if date is in the future, or if today and end time hasn't passed
    return todo.date > currentDate || (todo.date === currentDate && todo.endTime > currentTime);
  });
  
  await prisma.$disconnect();
  return NextResponse.json(activeTodos);
}

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const body = await req.json();
  const { date, startTime, endTime, name } = body;

  if (!date || !startTime || !endTime || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: {
      date,
      startTime,
      endTime,
      name,
    },
  });
  
  await prisma.$disconnect();
  revalidatePath('/');

  return NextResponse.json(todo, { status: 201 });
}
