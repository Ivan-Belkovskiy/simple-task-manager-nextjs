'use client';

import "./AppContainer.css";
import { Category, Priority, Task, User } from "@/app/page";
import MainUI from "../MainUI/MainUI";
import TaskList from "../TaskList/TaskList";
import { useState } from "react";
import RealtimeController from "../RealtimeController/RealtimeController";

interface AppContainerProps {
   tasks: Task[];
   categories: Category[];
   priorities: Priority[];
   users: User[];
}

export default function AppContainer({ tasks, categories, priorities, users }: AppContainerProps) {
   const [currentDate, setCurrentDate] = useState<Date>();
   return (
      <main className="app-container">
         {/* <h1 className="app-title">Менеджер Задач</h1> */}
         <h1 className="date-display">{currentDate?.toLocaleString('ru-RU') || "[Загрузка...] Менеджер Задач 2.0"}</h1>
         {/* <hr className="divider" /> */}
         <TaskList initialTasks={tasks} categories={categories} priorities={priorities} users={users} />

         <MainUI categories={categories} priorities={priorities} users={users} />

         <RealtimeController currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </main>
   )
}