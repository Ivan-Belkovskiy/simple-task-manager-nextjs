import { Prisma } from "@prisma/client";
import "./SubTaskEditor.css";

export type SubTask = Prisma.subtasksGetPayload<{}>;

export interface SubTaskEditorProps {
    subTasks: SubTask[];
    updateSubTasks: (newData: SubTask[]) => void;
}

export default function SubTaskEditor({
    subTasks
}: SubTaskEditorProps) {
    return (
        <div className="subtask-editor">
            <span className="subtask-editor__label">Подзадачи:</span>
            <div className="subtask-editor__subtasks">
                {subTasks.map((subTask, i) => (
                    <div className="subtask-editor-element">
                        <div className="subtask-editor-element__left">
                            <span className="subtask-editor-element_label subtask-index">{i}</span>
                            
                        </div>
                        <div className="subtask-editor-element__right"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}