'use client';

import { Dispatch, RefObject, SetStateAction, useState } from "react";
import FloatingActionButton from "../UI/FloatingActionButton/FloatingActionButton";
import "./MainUI.css";
import AddTaskModal from "../UI/AddTaskModal/AddTaskModal";
import { Category, Priority, User } from "@/app/page";


export default function MainUI({ isEditMode, categories, priorities, users }: {
    isEditMode?: RefObject<boolean>;
    setEditMode?: Dispatch<SetStateAction<boolean | undefined>>

    categories: Category[];
    priorities: Priority[];
    users: User[];
}) {
    const [isModalOpened, setModalOpened] = useState(false);

    const toggleModal = () => {
        setModalOpened(p => !p);
        if (isEditMode) isEditMode.current = !isEditMode.current;
    }

    const closeModal = () => {
        setModalOpened(false);
        if (isEditMode) isEditMode.current = false;
    }

    return (
        <div className="main-ui">
            <FloatingActionButton
                content={{
                    desktop: "+",
                    mobile: "+ Создать задачу"
                }}
                position={{
                    right: 15,
                    bottom: 15,
                }}
                onClick={() => toggleModal()}
            />

            {isModalOpened && (
                <AddTaskModal categories={categories} priorities={priorities} users={users} onClose={() => closeModal()} />
            )}
        </div>
    );
}