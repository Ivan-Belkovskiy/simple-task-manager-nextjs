import TaskList from "@/components/TaskList/TaskList";
import "./page.css";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Image from "next/image";

export type Task = Prisma.tasksGetPayload<{
    include: {
        task_categories: true;
        task_priorities: true;
        task_users: {
            include: {
                users: true;
            }
        }
    }
}>;

export type Category = Prisma.task_categoriesGetPayload<{}>;
export type Priority = Prisma.task_prioritiesGetPayload<{}>;
export type User = Prisma.usersGetPayload<{}>;

export default async function Home() {
  const tasks: Task[] = await prisma.tasks.findMany({
    include: {
      task_categories: true,
      task_priorities: true,
      task_users: {
        include: {
          users: true
        }
      },
    },
    orderBy: [
      { completed: 'asc' },
      { priority_id: 'desc' },
      { complete_before_date: 'asc' }
    ]
  });

  const categories = await prisma.task_categories.findMany();
  const priorities = await prisma.task_priorities.findMany();
  const users = await prisma.users.findMany();

  return (
    <div className="page-wrapper">
      <main className="page-container">
        {/* <h1 className="app-title">Менеджер Задач</h1> */}
        <h1 className="date-display">{new Date().toLocaleDateString('ru-RU')}</h1>
        {/* <hr className="divider" /> */}
        <TaskList initialTasks={tasks} categories={categories} priorities={priorities} users={users} />
      </main>
    </div>
  );
}
