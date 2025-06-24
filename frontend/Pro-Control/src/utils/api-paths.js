export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // Регистрация нового пользователя (администратор или участник)
        LOGIN: "/api/auth/login",       // Аутентификация пользователя и получение JWT-токена
        GET_PROFILE: "/api/auth/profile", // Получение данных авторизованного пользователя
    },

    USERS: {
        GET_ALL_USERS: "/api/users", // Получить всех пользователей (только для администратора)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Получить пользователя по ID
        CREATE_USER: "/api/users",   // Создать нового пользователя (только для администратора)
        UPDATE_USER: (userId) => `/api/users/${userId}`, // Обновить данные пользователя
        DELETE_USER: (userId) => `/api/users/${userId}`, // Удалить пользователя
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Получить данные для административной панели
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Получить данные панели пользователя
        GET_ALL_TASKS: "/api/tasks", // Получить все задачи (админ: все, пользователь: только назначенные)
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Получить задачу по ID
        CREATE_TASK: "/api/tasks", // Создать новую задачу (только для администратора)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Обновить задачу
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Удалить задачу (только для администратора)

        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Обновить статус задачи
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Обновить чеклист подзадач
    },

    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", // Скачать все задачи в формате Excel/PDF
        EXPORT_USERS: "/api/reports/export/users", // Скачать отчёт по пользователям и задачам
    },

    IMAGE: {
        UPLOAD_IMAGE: "api/auth/upload-image", // Загрузка изображения
    },
};
