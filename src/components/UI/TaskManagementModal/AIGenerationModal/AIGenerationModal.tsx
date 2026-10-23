import { useState } from "react"
import { SubTaskData, TaskFormData, TaskItemData } from "../types";
import SubTaskEditor from "../../SubTaskEditor/SubTaskEditor";
import TaskItemsEditor from "../../TaskItemsEditor/TaskItemsEditor";

import "./AIGenerationModal.css";
import GenerateButton from "../GenerateButton";

interface GeneratedData {
    subtasks: SubTaskData[];
    items: TaskItemData[];
}

export interface AIPromptData {
    prompt: string;
    generatedData?: GeneratedData | null;
    isSubmitted?: boolean;
};

export default function AIGenerationModal({ initialData, onClose }: { initialData: TaskFormData; onClose?: () => void; }) {

    const [generated, setGenerated] = useState<GeneratedData>({
        subtasks: initialData.subtasks || [],
        items: initialData.items || [],
    });

    const [isGenerating, setGenerating] = useState(false);

    const [generationCount, setGenerationCount] = useState(0);

    
    const [prompts, setPrompts] = useState<AIPromptData[]>([
        {
            prompt: 'Пример промпта',
            generatedData: null,
            isSubmitted: true,
        },
         {
            prompt: 'Пример промпта',
            generatedData: null,
            isSubmitted: true,
        },
        {
            prompt: '',
            generatedData: null,
            isSubmitted: false,
        },
    ]);

    const [current, setCurrent] = useState(prompts.length - 1);

    const currentPrompt = prompts[prompts.length - 1];

    const updatePromptData = (idx: number, data: Partial<AIPromptData>) => {
        setPrompts(p => p.map((_, i) => (i === idx) ? ({
            ..._,
            ...data,
        }) : _));
    }

    const updateGenerated = (data: any) => {
        setPrompts(p => [...p.map((_, i) => (i === p.length - 1) ? ({
            ..._,
            generatedData: data,
            isSubmitted: true,
        }) : _), {
            prompt: '',
            isSubmitted: false,
        }]);

        setGenerationCount(p => p + 1);

        setGenerated({
            subtasks: data.subtasks || [],
            items: data.items || [],
        });
    }

    return (
        <div className="ai-generation-modal__overlay">
            <div className="ai-generation-modal">
                <header className="ai-generation-modal__header">
                    <h1 className="ai-generation-modal__title">Генерация данных задачи</h1>
                    <button
                        className="ai-generation-modal__close-modal-btn"
                        onClick={onClose}
                    >⨉</button>
                </header>
                <div className="ai-generation-modal__content">
                    <div className="ai-generation-modal__left">

                        <div className="ai-generation-modal__top">
                            <div className="ai-generation-modal__prompts">
                                {prompts.filter(p => p.isSubmitted).map((p, idx) => (
                                    <div 
                                    className={`ai-generation-modal__prompt ${(idx === current ? 'current' : '')}`}
                                    onClick={() => {
                                        setCurrent(idx);
                                        setGenerated(p.generatedData || {
                                            subtasks: [],
                                            items: []
                                        });
                                    }}
                                    >
                                        {p.prompt}
                                    </div>
                                ))}
                                {/* <div className="ai-generation-modal__prompt-input">
                                    <textarea
                                        className="ai-generation-modal__input"
                                        value={currentPrompt.prompt}
                                        onChange={(e) => updatePromptData(prompts.length - 1, {
                                            prompt: e.target.value
                                        })}
                                    ></textarea>
                                </div> */}
                            </div>
                        </div>
                        <div className="ai-generation-modal__bottom">
                            <div className="ai-generation-modal__prompt-input">
                                <textarea
                                    className="ai-generation-modal__input"
                                    value={currentPrompt.prompt}
                                    onChange={(e) => updatePromptData(prompts.length - 1, {
                                        prompt: e.target.value
                                    })}
                                    placeholder="Введите запрос для детализации сгенерированных данных от ИИ"
                                ></textarea>
                            </div>
                            <GenerateButton
                                action="generation"
                                onGenerationStart={() => {
                                    setCurrent(prompts.length - 1);
                                    setGenerating(true);
                                }}
                                onGenerationEnd={() => {
                                    setGenerating(false);
                                }}
                                data={initialData}
                                onApply={updateGenerated}
                                prompts={prompts}
                                generations={{
                                    current: generationCount,
                                    max: 10
                                }}
                                disabled={isGenerating || (generationCount >= 10)}
                            />
                        </div>

                    </div>
                    <div className="ai-generation-modal__right">
                        <SubTaskEditor
                            mode="editor"
                            subtasks={generated.subtasks}
                            onChange={() => 1}
                            disabled
                        />
                        <TaskItemsEditor
                            mode="editor"
                            items={generated.items}
                            onChange={() => 1}
                            disabled
                        />
                        <div className="ai-generation-modal__buttons">
                            <button className="ai-generation-modal__button">Редактировать данные</button>
                            <button className="ai-generation-modal__button">Применить изменения</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}