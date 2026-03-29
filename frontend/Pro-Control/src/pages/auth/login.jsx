import {useContext, useState} from 'react';
import {AuthLayout} from "../../components/layouts/auth-layout.jsx";
import {Input} from "../../components/inputs/input.jsx";
import {Link, useNavigate} from "react-router-dom";
import {validateEmail} from "../../utils/helper.js";
import axiosInstance from "../../utils/axios-instance.js";
import {API_PATHS} from "../../utils/api-paths.js";
import {UserContext} from "../../context/user-context.jsx";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const {updateUser} = useContext(UserContext)
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
                updateUser(response.data)

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
            <>
                <div className="w-full space-y-2 text-left">
                    <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        С возвращением
                    </h3>
                    <p className="text-sm font-normal leading-relaxed text-zinc-500">
                        Пожалуйста, введите свои данные для входа
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex w-full flex-col gap-4">
                    <Input
                        value={email}
                        onChange={({target}) => setEmail(target.value)}
                        label="Электронная почта"
                        placeholder="ivan@example.com"
                        type="text"
                    />

                    <Input
                        value={password}
                        onChange={({target}) => setPassword(target.value)}
                        label="Пароль"
                        placeholder="Минимум 8 символов"
                        type="password"
                    />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button type="submit" className="btn-primary">
                        ВОЙТИ
                    </button>

                    <p className="text-center text-sm text-zinc-500">
                        Ещё нет аккаунта?{" "}
                        <Link
                            className="font-medium text-primary underline underline-offset-4 hover:opacity-90"
                            to="/signUp"
                        >
                            Зарегистрироваться
                        </Link>
                    </p>
                </form>
            </>
        </AuthLayout>
    );
};
