'use client';

import "./AppContainer.css";
import { Category, Priority, Task, User } from "@/app/(protected)/page";
import MainUI from "../MainUI/MainUI";
import TaskList from "../TaskList/TaskList";
import { useEffect, useRef } from "react";
import RealtimeController from "../RealtimeController/RealtimeController";
import TaskNotificationModal from "../UI/TaskNotificationModal/TaskNotificationModal";
import ClockDisplay from "../UI/ClockDisplay/ClockDisplay";

interface AppContainerProps {
   tasks: Task[];
   categories: Category[];
   priorities: Priority[];
   users: User[];
}

export default function AppContainer({ tasks, categories, priorities, users }: AppContainerProps) {
   const isEditMode = useRef(false);

   const activateNotificationRef = useRef<((data: Task) => void) | null>(null);
   const isOpenedNotificationRef = useRef<boolean>(false);

   return (
      <main className="app-container">
         <ClockDisplay className="date-display" />

         <TaskList
             isEditMode={isEditMode}
             initialTasks={tasks}
             categories={categories}
             priorities={priorities}
             users={users}
         />

         <MainUI
             isEditMode={isEditMode}
             categories={categories}
             priorities={priorities}
             users={users}
         />

         <TaskNotificationModal
             activateRef={activateNotificationRef}
             isOpenedRef={isOpenedNotificationRef}
         />

         <RealtimeController
             activateNotificationRef={activateNotificationRef}
             isNotificationOpenRef={isOpenedNotificationRef}
             tasks={tasks}
             isEditMode={isEditMode}
         />
      </main>
   );
}