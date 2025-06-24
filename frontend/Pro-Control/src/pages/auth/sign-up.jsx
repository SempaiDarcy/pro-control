import {useContext, useState} from "react";
import {ProfilePhotoSelector} from "../../components/inputs/profile-photo-selector.jsx";
import {validateEmail} from "../../utils/helper";
import {Input} from "../../components/Inputs/Input";
import {Link, useNavigate} from "react-router-dom";

import {AuthLayout} from "../../components/layouts/auth-layout.jsx";

export const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminInviteToken, setAdminInviteToken] = useState("");

    const [error, setError] = useState(null);

    // Handle SignUp Form Submit
    const handleSignUp = async (e) => {
        e.preventDefault();

        let profileImageUrl = '';

        if (!fullName) {
            setError("Пожалуйста, введите полное имя.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Пожалуйста, введите корректный адрес электронной почты.");
            return;
        }

        if (!password) {
            setError("Пожалуйста, введите пароль.");
            return;
        }

        setError("");

        // SignUp API Call
    };

    return (
        <AuthLayout>
            <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-black">Создание аккаунта</h3>
                <p className="text-xs text-slate-700 mt-[5px] mb-6">
                    Присоединяйтесь к нам, указав свои данные ниже.
                </p>

                <form onSubmit={handleSignUp}>
                    <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            value={fullName}
                            onChange={({target}) => setFullName(target.value)}
                            label="Полное имя"
                            placeholder="Иван Иванов"
                            type="text"
                        />

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

                        <Input
                            value={adminInviteToken}
                            onChange={({target}) => setAdminInviteToken(target.value)}
                            label="Код приглашения администратора"
                            placeholder="6-значный код"
                            type="text"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" className="btn-primary">
                        СОЗДАТЬ АККАУНТ
                    </button>

                    <p className="text-[13px] text-slate-800 mt-3">
                        Уже есть аккаунт?{" "}
                        <Link className="font-medium text-primary underline" to="/login">
                            Войти
                        </Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    );
};
