'use client';

import "./TaskList.css";
import { Task, Category, Priority, User } from "@/app/page";
import { Prisma } from "@prisma/client"
import TaskBlock from "./TaskBlock/TaskBlock";
import { useEffect, useState } from "react";
import MultiSelect from "../UI/MultiSelect/MultiSelect";

export default function TaskList({ initialTasks, categories, priorities, users }: {
    initialTasks: Task[],
    categories: Category[],
    priorities: Priority[],
    users: User[]

}) {

    const [filterCategory, setFilterCategory] = useState<number | string>("[[ANY]]");
    const [filterPriority, setFilterPriority] = useState<number | string>("[[ANY]]");
    const [filterUsers, setFilterUsers] = useState<(string | number)[]>(users.map(u => u.id));


    return (
        <div className="task-list">
            <div className="task-list__filters">
                <span className="task-list__filters-title">Фильтры:</span>
                <div className="task-list__filter">
                    <div className="task-list__label">Категория:</div>
                    <select
                        className="task-list__select"
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                        }}
                    >
                        <option value="[[ANY]]">Любая</option>
                        {categories.map(c => (
                            <option value={c.id} key={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="task-list__filter">
                    <div className="task-list__label">Приоритет:</div>
                    <select
                        className="task-list__select"
                        value={filterPriority}
                        onChange={(e) => {
                            setFilterPriority(e.target.value);
                        }}
                    >
                        <option value="[[ANY]]">Любой</option>
                        {priorities.map(p => (
                            <option value={p.id} key={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="task-list__filter">
                    <div className="task-list__label">Ответственный за выполнение:</div>
                    <MultiSelect
                        className="task-list__select"
                        value={filterUsers}
                        onSelect={(newValue) => setFilterUsers(newValue)}
                        options={users.map(user => ({
                            label: user.name,
                            value: user.id,
                        }))}
                    />
                </div>
            </div>
            <div className="task-list__content">
                {initialTasks.filter(t => (
                    t.category_id === (filterCategory === '[[ANY]]' ? t.category_id : Number(filterCategory)) &&
                    t.priority_id === (filterPriority === '[[ANY]]' ? t.priority_id : Number(filterPriority)) &&
                    t.task_users.some(u => filterUsers.includes(u.users.id))
                )).map((task, idx) => (
                    <TaskBlock idx={idx} data={task} key={task.id} categories={categories} users={users} priorities={priorities} />
                ))}
            </div>
        </div>
    )
}