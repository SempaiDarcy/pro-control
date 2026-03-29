import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { useUserAuth } from "../../hooks/use-user-auth.jsx";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import toast from "react-hot-toast";
import { SelectDropdown } from "../../components/inputs/select-dropdown.jsx";
import { SelectUsers } from "../../components/inputs/select-users.jsx";

const PROJECT_STATUS_OPTIONS = [
    { label: "Планирование", value: "Planning" },
    { label: "Активен", value: "Active" },
    { label: "Завершён", value: "Completed" },
    { label: "На паузе", value: "On Hold" },
];

export const CreateProject = () => {
    useUserAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Planning",
        startDate: "",
        dueDate: "",
        members: [],
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.title.trim()) {
            setError("Введите название проекта");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                status: form.status,
                members: form.members,
            };
            if (form.startDate) {
                payload.startDate = new Date(form.startDate).toISOString();
            }
            if (form.dueDate) {
                payload.dueDate = new Date(form.dueDate).toISOString();
            }

            await axiosInstance.post(API_PATHS.PROJECTS.CREATE, payload);
            toast.success("Проект создан");
            navigate("/admin/projects");
        } catch (e) {
            const msg =
                e.response?.data?.message || "Не удалось создать проект";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout activeMenu="/admin/projects">
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                    <div className="form-card col-span-3">
                        <h2 className="text-xl md:text-xl font-medium">Создать проект</h2>

                        <div className="mt-4">
                            <label className="text-xs font-medium text-slate-600">
                                Название проекта
                            </label>
                            <input
                                placeholder="Введите название"
                                className="form-input"
                                value={form.title}
                                onChange={({ target }) =>
                                    handleChange("title", target.value)
                                }
                            />
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">
                                Описание
                            </label>
                            <textarea
                                placeholder="Кратко опишите проект"
                                className="form-input"
                                rows={4}
                                value={form.description}
                                onChange={({ target }) =>
                                    handleChange("description", target.value)
                                }
                            />
                        </div>

                        <div className="grid grid-cols-12 gap-4 mt-3">
                            <div className="col-span-12 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">
                                    Статус
                                </label>
                                <SelectDropdown
                                    options={PROJECT_STATUS_OPTIONS}
                                    value={form.status}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    placeholder="Статус"
                                />
                            </div>
                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">
                                    Дата начала
                                </label>
                                <input
                                    className="form-input"
                                    type="date"
                                    value={form.startDate}
                                    onChange={({ target }) =>
                                        handleChange("startDate", target.value)
                                    }
                                />
                            </div>
                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">
                                    Срок / дедлайн
                                </label>
                                <input
                                    className="form-input"
                                    type="date"
                                    value={form.dueDate}
                                    onChange={({ target }) =>
                                        handleChange("dueDate", target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">
                                Участники
                            </label>
                            <SelectUsers
                                selectedUsers={form.members}
                                setSelectedUsers={(value) =>
                                    handleChange("members", value)
                                }
                            />
                        </div>

                        {error ? (
                            <p className="text-xs font-medium text-red-500 mt-5">
                                {error}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap justify-end gap-3 mt-7">
                            <button
                                type="button"
                                className="card-btn"
                                onClick={() => navigate("/admin/projects")}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="add-btn !w-auto min-w-[160px]"
                                disabled={loading}
                                onClick={handleSubmit}
                            >
                                {loading ? "Сохранение…" : "Создать проект"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
