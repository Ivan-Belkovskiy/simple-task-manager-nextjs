'use client';

import "./AppContainer.css";
import { Category, Priority, Task, User } from "@/app/page";
import MainUI from "../MainUI/MainUI";
import TaskList from "../TaskList/TaskList";
import { useRef, useState } from "react";
import RealtimeController from "../RealtimeController/RealtimeController";
import TaskNotificationModal from "../UI/TaskNotificationModal/TaskNotificationModal";

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

   const activateNotificationRef = useRef<((data: Task) => void) | null>(null);
   const isOpenedNotificationRef = useRef<boolean>(false);

   return (
      <main className="app-container">
         {/* <h1 className="app-title">Менеджер Задач</h1> */}
         <h1 className="date-display">{currentDate?.toLocaleString('ru-RU').replace(',', ' |') || "[Загрузка...] Менеджер Задач 2.0"}</h1>
         {/* <hr className="divider" /> */}
         <TaskList isEditMode={isEditMode} initialTasks={tasks} categories={categories} priorities={priorities} users={users} />

         <MainUI isEditMode={isEditMode} categories={categories} priorities={priorities} users={users} />

         <TaskNotificationModal activateRef={activateNotificationRef} isOpenedRef={isOpenedNotificationRef} />

         <RealtimeController activateNotificationRef={activateNotificationRef} isNotificationOpenRef={isOpenedNotificationRef} tasks={tasks} isEditMode={isEditMode} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </main>
   )
}