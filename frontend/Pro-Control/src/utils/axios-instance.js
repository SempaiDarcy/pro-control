import axios from "axios";
import { BASE_URL } from "./api-paths";

// Создание экземпляра axios с базовыми настройками
const axiosInstance = axios.create({
    baseURL: BASE_URL,            // Базовый URL для всех запросов
    timeout: 10000,               // Таймаут: 10 секунд
    headers: {
        "Content-Type": "application/json",  // Тип содержимого — JSON
        Accept: "application/json",          // Принимать ответ в формате JSON
    },
});

// Перехватчик исходящих запросов
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token"); // Получение токена из localStorage
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`; // Добавление токена в заголовки
        }
        return config;
    },
    (error) => {
        return Promise.reject(error); // Обработка ошибки перед отправкой запроса
    }
);

// Перехватчик входящих ответов
axiosInstance.interceptors.response.use(
    (response) => {
        return response; // Просто вернуть ответ, если всё прошло успешно
    },
    (error) => {
        // Глобальная обработка распространённых ошибок
        if (error.response) {
            if (error.response.status === 401) {
                // Неавторизован — перенаправить на страницу входа
                window.location.href = "/login";
            } else if (error.response.status === 500) {
                // Ошибка сервера
                console.error("Ошибка сервера. Пожалуйста, попробуйте позже.");
            }
        } else if (error.code === "ECONNABORTED") {
            // Превышено время ожидания запроса
            console.error("Превышено время ожидания. Повторите попытку.");
        }
        return Promise.reject(error); // Передать ошибку дальше
    }
);

export default axiosInstance;
