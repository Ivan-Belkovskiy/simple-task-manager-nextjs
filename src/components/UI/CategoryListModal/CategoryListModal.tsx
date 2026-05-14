'use client';

import { Category } from "@/app/page";
import "./CategoryListModal.css";
import { useState } from "react";
import { createCategory, createUser, deleteCategory, deleteUser } from "@/app/actions";

export default function CategoryListModal({ categories, onClose }: { categories: Category[]; onClose?: () => void; }) {
    const [newCategoryData, setNewCategoryData] = useState<string>();
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const confirmAddCategory = async () => {
        if (newCategoryData) await createCategory(newCategoryData);

        setNewCategoryData(undefined);
    }

    const confirmDeleteCategory = async () => {
        if (idToDelete !== null) await deleteCategory(idToDelete);

        setIdToDelete(null);
    }


    return (
        <div className="category-list-modal__overlay">
            <div className="category-list-modal">
                <div className="category-list-modal__header">
                    <h1 className="category-list-modal__title">Все категории</h1>
                    <button className="close-modal-button" onClick={() => onClose?.()}>⨉</button>
                </div>
                <div className="category-list-modal__content">
                    {categories.map(c => (
                        <div className={`category-list-modal__user ${(c.id === idToDelete) ? 'to-delete' : (idToDelete !== null) ? 'delete-mode' : ''}`} key={c.id}>
                            <span className="category-list-modal__username">{c.name}</span>
                            <button
                                className="category-list-modal__button user-delete-btn"
                                onClick={() => {
                                    if (newCategoryData === undefined) setIdToDelete(c.id);
                                }}
                            >⨉</button>
                        </div>
                    ))}
                </div>
                {(idToDelete !== null) ? (
                    <div className="category-list-modal__user-creation-form">
                        <span className="category-list-modal__label delete-user-notification">Удалить выбранную категорию?</span>
                        <button
                            className="category-list-modal__button cancel-add-user"
                            onClick={() => setIdToDelete(null)}
                        >↩</button>
                        <button
                            className="category-list-modal__button confirm-add-user"
                            onClick={() => confirmDeleteCategory()}
                        >✔</button>
                    </div>
                ) : (newCategoryData !== undefined) ? (
                    <div className="category-list-modal__user-creation-form">
                        <input
                            type="text"
                            className="category-list-modal__input"
                            value={newCategoryData}
                            onChange={(e) => setNewCategoryData(e.target.value)}
                        />
                        <button
                            className="category-list-modal__button cancel-add-user"
                            onClick={() => setNewCategoryData(undefined)}
                        >↩</button>
                        <button
                            className="category-list-modal__button confirm-add-user"
                            onClick={() => confirmAddCategory()}
                        >✔</button>
                    </div>
                ) : (
                    <button
                        className="category-list-modal__user add-user-btn"
                        onClick={() => setNewCategoryData('')}
                    >Добавить...</button>
                )}
            </div>
        </div>
    );
}