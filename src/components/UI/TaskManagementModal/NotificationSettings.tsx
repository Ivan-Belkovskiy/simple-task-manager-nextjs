import { formatHourTextForNotification } from '@/utils/datetime';
import { FormNotification, ModalMode } from './types';

interface Props {
    mode: ModalMode;
    notifications: FormNotification[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, value: number) => void;
}

export default function NotificationSettings({ mode, notifications, onAdd, onRemove, onUpdate }: Props) {
    const showStatus = mode !== 'create';

    return (
        <div className="task-management-modal__block notification-settings">
            <h1>Настройки уведомления</h1>
            <div className="notification-settings__notification-list">
                {notifications.map((n, idx) => (
                    <div className="notification-settings__notification" key={n.id ?? idx}>
                        <span className="notification-settings__number">{idx + 1}-й раз</span>

                        <div className="notification-settings__block">
                            <span className="notification-settings__label --desktop-only">Напомнить за</span>
                            <span className="notification-settings__label --mobile-only">За</span>
                            <input
                                type="number"
                                className="notification-settings__input"
                                value={n.hour_offset}
                                disabled={n.activated}
                                onChange={(e) => onUpdate(idx, Number(e.target.value))}
                            />
                            <span className="notification-settings__label">
                                {formatHourTextForNotification(n.hour_offset)}
                                <span className="--desktop-only"> до окончания периода</span>
                            </span>
                        </div>

                        {showStatus && (
                            <div className={`notification-settings__block ${
                                n.isNew ? 'status-new' : (n.activated ? 'status-activated' : 'status-waiting')
                            }`}>
                                <span className="notification-settings__label --desktop-only">
                                    {n.isNew ? 'Новое' : (n.activated ? 'Активировано' : 'Ожидается...')}
                                </span>
                                <span className="notification-settings__label --mobile-only">
                                    {n.isNew ? 'NEW' : (n.activated ? '✔' : '🕑')}
                                </span>
                            </div>
                        )}

                        {!n.activated && (
                            <button
                                className="notification-settings__button remove-notification-btn"
                                onClick={() => onRemove(idx)}
                            >
                                <span className="--desktop-only">Удалить</span>
                                <span className="--mobile-only">⨉</span>
                            </button>
                        )}
                    </div>
                ))}

                <button className="notification-settings__button add-button" onClick={onAdd}>
                    Добавить напоминание
                </button>
            </div>
        </div>
    );
}