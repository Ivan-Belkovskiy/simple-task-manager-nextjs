'use client';

import { useState } from "react";
import FloatingActionButton from "../UI/FloatingActionButton/FloatingActionButton";
import "./MainUI.css";
import AddTaskModal from "../UI/AddTaskModal/AddTaskModal";
import { Category, Priority, User } from "@/app/page";


export default function MainUI({ categories, priorities, users }: {
    categories: Category[],
    priorities: Priority[],
    users: User[],
}) {
    const [isModalOpened, setModalOpened] = useState(false);

    return (
        <div className="main-ui">
            <FloatingActionButton
                content="+"
                position={{
                    right: 15,
                    bottom: 15,
                }}
                onClick={() => setModalOpened(p => !p)}
            />

            {isModalOpened && (
                <AddTaskModal categories={categories} priorities={priorities} users={users} onClose={() => setModalOpened(false)} />
            )}
        </div>
    );
}