'use client';

import { Category } from "@/app/(protected)/page";
import "./CategoryListModal.css";
import { useState } from "react";
import { createCategory, deleteCategory } from "@/app/actions";
import { generateCategoryTree } from "@/utils/utils";
import SimpleModal from "../NEW/SimpleModal/SimpleModal";

type ModalState = {
    type: "add" | "delete" | "edit";
    data?: Category;
} | null;

export default function CategoryListModal({ categories, onClose }: { categories: Category[]; onClose?: () => void; }) {
    const [isLoading, setLoading] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const [openedModal, setOpenedModal] = useState<ModalState>(null);

    const confirmAddCategory = async (val: string) => {
        if (openedModal?.type !== 'add') return;

        setLoading(true);

        await createCategory({
            name: val,
            parentId: openedModal.data?.id || null,
        });

        setLoading(false);

        setOpenedModal(null);
    }

    const confirmDeleteCategory = async () => {
        if (openedModal?.type !== 'delete' || !openedModal.data) return;
        setLoading(true);

        await deleteCategory(openedModal.data.id);

        setLoading(false);
        setOpenedModal(null);
    }


    const renderCategories = (categories: (Category & { children?: any })[], level: number) => {
        if (level > 25) return null;

        return categories.map(c => (
            <div className={`category-list-modal__block level-${level}`} style={{ marginLeft: `${(level * 10)}px` }}>
                <div className={`category-list-modal__category ${(c.id === idToDelete) ? 'to-delete' : (idToDelete !== null) ? 'delete-mode' : ''}`} key={c.id}>
                    <span className="category-list-modal__categoryname">{c.name}</span>
                    <button
                        className="category-list-modal__button category-delete-btn"

                        onClick={() => {
                            setOpenedModal({ type: "delete", data: c })
                            // if (newCategoryData === undefined) setIdToDelete(c.id);
                        }}
                    >⨉</button>
                </div>
                <div className="category-list-modal__children">
                    {renderCategories(c.children, (level + 1))}
                    <button
                        className="category-list-modal__button add-category-button"
                        onClick={() => setOpenedModal({
                            type: "add",
                            data: c,
                        })}
                        style={{ marginLeft: '10px' }}
                    >Добавить категорию...</button>
                </div>
            </div>
        ));
    }

    const generatedTree = generateCategoryTree(categories);

    return (
        <div className="category-list-modal__overlay">
            <div className="category-list-modal">
                <div className="category-list-modal__header">
                    <h1 className="category-list-modal__title">Все категории</h1>
                    <button className="close-modal-button" onClick={() => onClose?.()}>⨉</button>
                </div>
                <div className="category-list-modal__content">
                    <div className="category-list-modal__categories">
                        {renderCategories(generatedTree, 0)}
                    </div>
                </div>
                {openedModal && (
                    (openedModal.type === 'add') ? (
                        <SimpleModal
                            type="prompt"
                            title={`Добавить категорию ${(categories.find(c => c.id === openedModal.data?.id) ? `внутри категории "${(
                                categories.find(c => c.id === openedModal.data?.id)?.name
                            )}"` : ``)}`}
                            message="Введите название новой категории"

                            confirmBtnText="Создать категорию"
                            cancelBtnText="Отмена"

                            onConfirm={confirmAddCategory}
                            onCancel={() => setOpenedModal(null)}

                            disableButtons={isLoading}
                        />
                    ) : (openedModal.type === 'delete') ? (
                        <SimpleModal
                            type="confirm"
                            title={`Удалить категорию "${openedModal.data?.name}"?`}
                            message="Все вложенные категории будут перенесены на уровень выше!"

                            confirmBtnText="Удалить"
                            cancelBtnText="Отмена"

                            onConfirm={confirmDeleteCategory}
                            onCancel={() => setOpenedModal(null)}

                            disableButtons={isLoading}
                        />
                    ) : (
                        <></>
                    )
                )}

                
                    <button
                        className="category-list-modal__button add-category-button level-root"
                        onClick={() => setOpenedModal({
                            type: "add",
                        })}
                        style={{ marginLeft: '10px' }}
                    >Добавить в корневой директории...</button>
                
                {/* {(idToDelete !== null) ? (
                    <div className="category-list-modal__category-creation-form">
                        <span className="category-list-modal__label delete-category-notification">Удалить выбранную категорию?</span>
                        <button
                            className="category-list-modal__button cancel-add-category"
                            onClick={() => setIdToDelete(null)}
                        >↩</button>
                        <button
                            className="category-list-modal__button confirm-add-category"
                            onClick={() => confirmDeleteCategory()}
                        >✔</button>
                    </div>
                ) : (newCategoryData !== undefined) ? (
                    <div className="category-list-modal__category-creation-form">
                        <input
                            type="text"
                            className="category-list-modal__input"
                            value={newCategoryData}
                            onChange={(e) => setNewCategoryData(e.target.value)}
                        />
                        <button
                            className="category-list-modal__button cancel-add-category"
                            onClick={() => setNewCategoryData(undefined)}
                        >↩</button>
                        <button
                            className="category-list-modal__button confirm-add-category"
                            onClick={() => confirmAddCategory()}
                        >✔</button>
                    </div>
                ) : (
                    <></>
                    // <button
                    //     className="category-list-modal__category add-category-btn"
                    //     onClick={() => setNewCategoryData('')}
                    // >Добавить...</button>
                )} */}
            </div>
        </div>
    );
}