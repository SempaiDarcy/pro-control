import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axios-instance";
import { API_PATHS } from "../utils/api-paths";

// Создание контекста пользователя
export const UserContext = createContext();

// Провайдер контекста пользователя
const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Состояние для хранения данных пользователя
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки

    useEffect(() => {
        if (user) return;

        const accessToken = localStorage.getItem("token");
        if (!accessToken) {
            setLoading(false); // Нет токена — прекращаем загрузку
            return;
        }

        const fetchUser = async () => {
            try {
                // Получение профиля пользователя по токену
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data); // Установка пользователя
            } catch (error) {
                console.error("Пользователь не авторизован", error);
                clearUser(); // Очистка состояния при ошибке
            } finally {
                setLoading(false); // Завершение загрузки в любом случае
            }
        };

        fetchUser();
    }, []);

    // Обновление данных пользователя (например, после входа)
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("token", userData.token); // Сохранение токена
        setLoading(false);
    };

    // Очистка состояния пользователя и удаление токена
    const clearUser = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    // Предоставление значений через контекст
    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
