export const dynamic = 'force-dynamic';

import TaskList from "@/components/TaskList/TaskList";
import "./page.css";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import FloatingActionButton from "@/components/UI/FloatingActionButton/FloatingActionButton";
import MainUI from "@/components/MainUI/MainUI";
import AppContainer from "@/components/AppContainer/AppContainer";
import { validateTasks } from "./actions";

export type Task = Prisma.tasksGetPayload<{
  include: {
    task_categories: true;
    task_priorities: true;
    task_users: {
      include: {
        users: true;
      }
    },
    task_notifications: true;
  }
}>;

export type Category = Prisma.task_categoriesGetPayload<{}>;
export type Priority = Prisma.task_prioritiesGetPayload<{}>;
export type User = Prisma.usersGetPayload<{}>;
export type Notification = Prisma.task_notificationsGetPayload<{}>;

export default async function Home() {

  await validateTasks();

  const tasks: Task[] = await prisma.tasks.findMany({
    include: {
      task_categories: true,
      task_priorities: true,
      task_users: {
        include: {
          users: true
        }
      },
      task_notifications: {
        include: {
          tasks: true,
        },
        orderBy: [
          { hour_offset: 'desc' }
        ]
      }
    },
    orderBy: [
      { completed: 'asc' },
      { rejected: 'asc' },
      { completed_at: 'desc' },
      { complete_before_date: 'asc' },
      { priority_id: 'desc' },
    ]
  });

  const categories = await prisma.task_categories.findMany();
  const priorities = await prisma.task_priorities.findMany();
  const users = await prisma.users.findMany();



  return (
    <div className="page-wrapper">
      <AppContainer tasks={tasks} categories={categories} priorities={priorities} users={users} />
    </div>
  );
}
