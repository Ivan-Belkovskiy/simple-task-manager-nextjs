'use client';

import { User } from "@/app/page";
import "./UserListModal.css";
import { useState } from "react";
import { createUser, deleteUser } from "@/app/actions";

export default function UserListModal({ users, onClose }: { users: User[]; onClose?: () => void; }) {
    const [newUserData, setNewUserData] = useState<string>();
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const confirmAddUser = async () => {
        if (newUserData) await createUser(newUserData);

        setNewUserData(undefined);
    }

    const confirmDeleteUser = async () => {
        if (idToDelete !== null) await deleteUser(idToDelete);

        setIdToDelete(null);
    }


    return (
        <div className="user-list-modal__overlay">
            <div className="user-list-modal">
                <div className="user-list-modal__header">
                    <h1 className="user-list-modal__title">Все пользователи</h1>
                    <button className="close-modal-button" onClick={() => onClose?.()}>⨉</button>
                </div>
                <div className="user-list-modal__content">
                    {users.map(u => (
                        <div className={`user-list-modal__user ${(u.id === idToDelete) ? 'to-delete' : (idToDelete !== null) ? 'delete-mode' : ''}`} key={u.id}>
                            <span className="user-list-modal__username">{u.name}</span>
                            <button
                                className="user-list-modal__button user-delete-btn"
                                onClick={() => {
                                    if (newUserData === undefined) setIdToDelete(u.id);
                                }}
                            >⨉</button>
                        </div>
                    ))}
                </div>
                {(idToDelete !== null) ? (
                    <div className="user-list-modal__user-creation-form">
                        <span className="user-list-modal__label delete-user-notification">Удалить выбранного пользователя?</span>
                        <button
                            className="user-list-modal__button cancel-add-user"
                            onClick={() => setIdToDelete(null)}
                        >↩</button>
                        <button
                            className="user-list-modal__button confirm-add-user"
                            onClick={() => confirmDeleteUser()}
                        >✔</button>
                    </div>
                ) : (newUserData !== undefined) ? (
                    <div className="user-list-modal__user-creation-form">
                        <input
                            type="text"
                            className="user-list-modal__input"
                            value={newUserData}
                            onChange={(e) => setNewUserData(e.target.value)}
                        />
                        <button
                            className="user-list-modal__button cancel-add-user"
                            onClick={() => setNewUserData(undefined)}
                        >↩</button>
                        <button
                            className="user-list-modal__button confirm-add-user"
                            onClick={() => confirmAddUser()}
                        >✔</button>
                    </div>
                ) : (
                    <button
                        className="user-list-modal__user add-user-btn"
                        onClick={() => setNewUserData('')}
                    >Добавить...</button>
                )}
            </div>
        </div>
    );
}