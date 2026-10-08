export const dynamic = 'force-dynamic';

import TaskList from "@/components/TaskList/TaskList";
import "./page.css";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import FloatingActionButton from "@/components/UI/FloatingActionButton/FloatingActionButton";
import MainUI from "@/components/MainUI/MainUI";
import AppContainer from "@/components/AppContainer/AppContainer";
import { validateTasks } from "../actions";
import { getSession } from "../actions/users/session";
import { redirect } from "next/navigation";


export type Task = Prisma.tasksGetPayload<{
  include: {
    category: true;
    priority: true;
    task_users: {
      include: { users: true };
    };
    task_notifications: {
      include: { task: true };
    };
    subtasks: true;
  }
}>;

export type Category = Prisma.task_categoriesGetPayload<{}>;
export type Priority = Prisma.task_prioritiesGetPayload<{}>;
export type User = Prisma.usersGetPayload<{}>;
export type Notification = Prisma.task_notificationsGetPayload<{}>;

export default async function Home() {

  const session = await getSession();

  if (!session) return redirect('/login');

  const user = await prisma.app_accounts.findUnique({ where: { id: session.userId } });

  if (!user) return redirect('/login');

  await validateTasks();

  const tasks: Task[] = await prisma.tasks.findMany({
    where: { account_id: user.id },
    include: {
      category: true,                
      priority: true,                  
      task_users: {
        include: { users: true },
      },
      task_notifications: {
        include: { task: true },
        orderBy: [{ hour_offset: 'desc' }],
      },
      subtasks: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [
      { completed: 'asc' },
      { rejected: 'asc' },
      { completed_at: 'desc' },
      { complete_before_date: 'asc' },
      { priority_id: 'desc' },
    ],
  });

  const categories = await prisma.task_categories.findMany({
    where: {
      account_id: user.id,
    }
  });
  const priorities = await prisma.task_priorities.findMany({});
  const users = await prisma.users.findMany({
    where: {
      account_id: user.id,
    }
  });



  return (
    <div className="page-wrapper">
      <AppContainer tasks={tasks} categories={categories} priorities={priorities} users={users} />
    </div>
  );
}
