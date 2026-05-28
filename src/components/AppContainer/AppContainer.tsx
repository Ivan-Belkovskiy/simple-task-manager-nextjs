'use client';

import "./AppContainer.css";
import { Category, Priority, Task, User } from "@/app/page";
import MainUI from "../MainUI/MainUI";
import TaskList from "../TaskList/TaskList";
import { useRef, useState } from "react";
import RealtimeController from "../RealtimeController/RealtimeController";

interface AppContainerProps {
   tasks: Task[];
   categories: Category[];
   priorities: Priority[];
   users: User[];
}

export default function AppContainer({ tasks, categories, priorities, users }: AppContainerProps) {
   const isEditMode = useRef(false);
   // const [isEditMode, setEditMode] = useState(false);
   const [currentDate, setCurrentDate] = useState<Date>();
   return (
      <main className="app-container">
         {/* <h1 className="app-title">Менеджер Задач</h1> */}
         <h1 className="date-display">{currentDate?.toLocaleString('ru-RU') || "[Загрузка...] Менеджер Задач 2.0"}</h1>
         {/* <hr className="divider" /> */}
         <TaskList isEditMode={isEditMode} initialTasks={tasks} categories={categories} priorities={priorities} users={users} />

         <MainUI isEditMode={isEditMode} categories={categories} priorities={priorities} users={users} />

         <RealtimeController isEditMode={isEditMode} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </main>
   )
}