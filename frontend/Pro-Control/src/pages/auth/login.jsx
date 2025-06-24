import { useState } from 'react';
import { AuthLayout } from "../../components/layouts/auth-layout.jsx";
import { Input } from "../../components/inputs/input.jsx";
import { Link, useNavigate } from "react-router-dom";
import {validateEmail} from "../../utils/helper.js";
import axiosInstance from "../../utils/axios-instance.js";
import {API_PATHS} from "../../utils/api-paths.js";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Обработка отправки формы входа
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError("Пожалуйста, введите корректный email.");
            return;
        }

        if (!password) {
            setError("Пожалуйста, введите пароль.");
            return;
        }

        setError("");
        // Вызов API для входа
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email,
                password,
            });

            const {token, role} = response.data;

            if (token) {
                localStorage.setItem("token", token);
                // updateUser(response.data)

                // Перенаправление в зависимости от роли
                if (role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/user/dashboard");
                }
            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                setError(error.response.data.message); // сообщение с сервера
            } else {
                setError("Что-то пошло не так. Пожалуйста, попробуйте ещё раз.");
            }
        }
    }

    return (
        <AuthLayout>
            <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-black">С возвращением</h3>
                <p className="text-xs text-slate-700 mt-[5px] mb-6">
                    Пожалуйста, введите свои данные для входа
                </p>

                <form onSubmit={handleLogin}>
                    <Input
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                        label="Электронная почта"
                        placeholder="ivan@example.com"
                        type="text"
                    />

                    <Input
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        label="Пароль"
                        placeholder="Минимум 8 символов"
                        type="password"
                    />

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" className="btn-primary">
                        ВОЙТИ
                    </button>

                    <p className="text-[13px] text-slate-800 mt-3">
                        Ещё нет аккаунта?{" "}
                        <Link className="font-medium text-primary underline" to="/signup">
                            Зарегистрироваться
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
};
