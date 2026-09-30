import { Category, Priority, User } from '@/app/page';
import { getLocalDateString } from '@/utils/datetime';
import CustomSelect from '../CustomSelect/CustomSelect';
import InteractiveList from '../InteractiveList/InteractiveList';
import MultiSelect from '../MultiSelect/MultiSelect';
import ErrorBlock from './ErrorBlock/ErrorBlock';
import { ModalMode, TaskFormData, ValidationErrors } from './types';

interface Props {
    mode: ModalMode;
    data: TaskFormData;
    setData: React.Dispatch<React.SetStateAction<TaskFormData>>;
    errors: ValidationErrors;
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
    showIsCompleted: boolean;
    categories: Category[];
    priorities: Priority[];
    users: User[];
    onOpenUserModal: () => void;
    onOpenCategoryModal: () => void;
}

export default function TaskFormFields({
    mode, data, setData, errors, setErrors, showIsCompleted,
    categories, priorities, users,
    onOpenUserModal, onOpenCategoryModal,
}: Props) {
    const update = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) =>
        setData(p => ({ ...p, [key]: value }));

    const clearError = (field: keyof ValidationErrors) => {
        if (errors[field]) setErrors(p => ({ ...p, [field]: false }));
    };

    return (
        <>
            <ErrorBlock
                text="Введите название задачи!"
                displayError={errors.name}
                className="task-management-modal__error-block"
            >
                <div className="task-management-modal__block">
                    <span className="task-management-modal__label">Название:</span>
                    <input
                        type="text"
                        className="task-management-modal__input task-name-input"
                        value={data.name}
                        onChange={(e) => {
                            clearError('name');
                            update('name', e.target.value);
                        }}
                    />
                </div>
            </ErrorBlock>

            <div className="task-management-modal__block">
                <span className="task-management-modal__label">Описание:</span>
                <textarea
                    className="task-management-modal__input task-name-input"
                    value={data.description}
                    onChange={(e) => update('description', e.target.value)}
                />
            </div>

            <div className="task-management-modal__block">
                <span className="task-management-modal__label">Приоритет:</span>
                <select
                    className="task-management-modal__select task-priority-select"
                    value={data.priority ?? ''}
                    onChange={(e) => update('priority', Number(e.target.value))}
                    style={{ color: priorities.find(p => p.id === data.priority)?.display_color || '' }}
                >
                    {priorities.map(p => (
                        <option key={p.id} value={p.id} style={{ color: p.display_color || '' }}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="task-management-modal__block">
                <span className="task-management-modal__label">Категория:</span>
                <CustomSelect
                    className="task-management-modal__select task-category-select"
                    value={data.category}
                    onSelect={(v) => update('category', v)}
                    options={[
                        { label: '—', value: '[[NONE]]' },
                        ...categories.map(c => ({ label: c.name, value: c.id })),
                        {
                            label: 'Добавить категорию...',
                            value: 'addCategory',
                            type: 'button',
                            btnCallback: onOpenCategoryModal,
                        },
                    ]}
                />
            </div>

            <ErrorBlock
                text="Добавьте минимум одного пользователя!"
                displayError={errors.users}
                className="task-management-modal__error-block"
            >
                <div className="task-management-modal__block --desktop-only">
                    <span className="task-management-modal__label">Ответственный за выполнение:</span>
                    <MultiSelect
                        className="task-management-modal__select task-user-select"
                        value={data.users}
                        onSelect={(v) => { clearError('users'); update('users', v); }}
                        options={[
                            ...users.map(u => ({ label: u.name, value: u.id })),
                            {
                                label: 'Добавить пользователя...',
                                value: '[[ADD]]',
                                type: 'button',
                                btnCallback: onOpenUserModal,
                            },
                        ]}
                    />
                </div>

                <div className="task-management-modal__block flex-col --mobile-only">
                    <span className="task-management-modal__label">Ответственный за выполнение:</span>
                    <InteractiveList
                        className="task-management-modal__list task-user-list"
                        value={data.users}
                        onSelect={(v) => { clearError('users'); update('users', v); }}
                        options={[
                            ...users.map(u => ({ label: u.name, value: u.id })),
                            {
                                label: 'Добавить пользователя...',
                                value: '[[ADD]]',
                                type: 'button',
                                btnCallback: onOpenUserModal,
                            },
                        ]}
                    />
                </div>
            </ErrorBlock>

            <div className="task-management-modal__block --mobile-only">
                <span className="task-management-modal__label">Ввести дату создания</span>
                <input
                    type="checkbox"
                    checked={!!data.allowEnterCreationDate}
                    onChange={(e) => update('allowEnterCreationDate', e.target.checked)}
                />
            </div>

            <div className="task-management-modal__block complete-before-datetime-block">
                <div className="--desktop-only" style={{ gap: 'inherit' }}>
                    <span className="task-management-modal__label">Ввести дату создания</span>
                    <input
                        type="checkbox"
                        checked={!!data.allowEnterCreationDate}
                        onChange={(e) => update('allowEnterCreationDate', e.target.checked)}
                    />
                </div>

                {data.allowEnterCreationDate && (
                    <>
                        <span className="task-management-modal__label">Дата создания:</span>
                        <input
                            type="datetime-local"
                            className="task-management-modal__input"
                            value={data.createdAt || ''}
                            onChange={(e) => update('createdAt', e.target.value)}
                        />
                    </>
                )}
            </div>

            <div className="task-management-modal__block complete-before-datetime-block">
                <span className="task-management-modal__label">Выполнить до:</span>

                {!data.disableCompleteBeforeDate && !data.isCompleted && (
                    <input
                        type="datetime-local"
                        className="task-management-modal__input"
                        min={getLocalDateString(new Date())}
                        value={data.completeBefore || ''}
                        onChange={(e) => {
                            const today = getLocalDateString(new Date());
                            update('completeBefore', e.target.value >= today ? e.target.value : today);
                        }}
                    />
                )}

                {showIsCompleted && !data.isCompleted && (
                    <div className="--desktop-only" style={{ gap: 'inherit' }}>
                        <span className="task-management-modal__label">Не указывать дату</span>
                        <input
                            type="checkbox"
                            checked={!!data.disableCompleteBeforeDate}
                            onChange={(e) => update('disableCompleteBeforeDate', e.target.checked)}
                        />
                    </div>
                )}

                {showIsCompleted && !data.disableCompleteBeforeDate && (
                    <div className="--desktop-only" style={{ gap: 'inherit' }}>
                        <span className="task-management-modal__label">Уже выполнена</span>
                        <input
                            type="checkbox"
                            checked={!!data.isCompleted}
                            onChange={(e) => update('isCompleted', e.target.checked)}
                        />
                    </div>
                )}

                {!showIsCompleted && !data.isCompleted && (
                    <div className="--desktop-only" style={{ gap: 'inherit' }}>
                        <span className="task-management-modal__label">Не указывать дату</span>
                        <input
                            type="checkbox"
                            checked={!!data.disableCompleteBeforeDate}
                            onChange={(e) => update('disableCompleteBeforeDate', e.target.checked)}
                        />
                    </div>
                )}
            </div>

            {showIsCompleted && !data.isCompleted && (
                <div className="task-management-modal__block --mobile-only">
                    <span className="task-management-modal__label">Не указывать дату</span>
                    <input
                        type="checkbox"
                        checked={!!data.disableCompleteBeforeDate}
                        onChange={(e) => update('disableCompleteBeforeDate', e.target.checked)}
                    />
                </div>
            )}
            {showIsCompleted && !data.disableCompleteBeforeDate && (
                <div className="task-management-modal__block --mobile-only">
                    <span className="task-management-modal__label">Уже выполнена</span>
                    <input
                        type="checkbox"
                        checked={!!data.isCompleted}
                        onChange={(e) => update('isCompleted', e.target.checked)}
                    />
                </div>
            )}
            {!showIsCompleted && !data.isCompleted && (
                <div className="task-management-modal__block --mobile-only">
                    <span className="task-management-modal__label">Не указывать дату</span>
                    <input
                        type="checkbox"
                        checked={!!data.disableCompleteBeforeDate}
                        onChange={(e) => update('disableCompleteBeforeDate', e.target.checked)}
                    />
                </div>
            )}

            {showIsCompleted && data.isCompleted && (
                <>
                    <div className="task-management-modal__block complete-before-datetime-block">
                        <span className="task-management-modal__label">Дата выполнения:</span>
                        <input
                            type="datetime-local"
                            className="task-management-modal__input"
                            value={data.completedAt || getLocalDateString(new Date())}
                            onChange={(e) => update('completedAt', e.target.value)}
                        />
                    </div>
                    <div className="task-management-modal__block --desktop-only">
                        <span className="task-management-modal__label">Примечание к выполнению:</span>
                        <textarea
                            className="task-management-modal__input task-name-input"
                            value={data.completeInfo || ''}
                            onChange={(e) => update('completeInfo', e.target.value)}
                        />
                    </div>
                    <div className="task-management-modal__block flex-col --mobile-only">
                        <span className="task-management-modal__label">Примечание к выполнению:</span>
                        <textarea
                            className="task-management-modal__input task-name-input"
                            value={data.completeInfo || ''}
                            onChange={(e) => update('completeInfo', e.target.value)}
                        />
                    </div>
                </>
            )}
        </>
    );
}