import {useEffect, useState} from "react";
import {DashboardLayout} from "../../components/layouts/dashboard-layout.jsx";
import {PRIORITY_DATA} from "../../utils/data";
import axiosInstance from "../../utils/axios-instance";
import {API_PATHS} from "../../utils/api-paths";
import toast from "react-hot-toast";
import {useLocation, useNavigate} from "react-router-dom";
import moment from "moment";
import {LuTrash2} from "react-icons/lu";
import {SelectDropdown} from "../../components/inputs/select-dropdown.jsx";
import {SelectUsers} from "../../components/inputs/select-users.jsx";
import {TodoListInput} from "../../components/inputs/todolist-input.jsx";
import {AddAttachmentsInput} from "../../components/inputs/add-attachments-input.jsx";
import {DeleteAlert} from "../../components/delete-alert.jsx";
import {Modal} from "../../components/modal.jsx";

export const CreateTask = () => {
    const location = useLocation();
    const {taskId} = location.state || {};
    const navigate = useNavigate();

    const [taskData, setTaskData] = useState({
        title: "",
        description: "",
        priority: "Low",
        dueDate: null,
        assignedTo: [],
        todoChecklist: [],
        attachments: [],
    });

    const [currentTask, setCurrentTask] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const handleValueChange = (key, value) => {
        setTaskData((prevData) => ({...prevData, [key]: value}));
    };

    const clearData = () => {
        setTaskData({
            title: "",
            description: "",
            priority: "Low",
            dueDate: null,
            assignedTo: [],
            todoChecklist: [],
            attachments: [],
        });
    };

    const createTask = async () => {
        setLoading(true);
        try {
            const todolist = taskData.todoChecklist?.map((item) => ({
                text: item,
                completed: false,
            }));

            await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
                ...taskData,
                dueDate: new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist,
            });

            toast.success("Задача успешно создана");
            clearData();
        } catch (error) {
            console.error("Ошибка при создании задачи:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async () => {
        setLoading(true);
        try {
            const todolist = taskData.todoChecklist?.map((item) => {
                const prevTodoChecklist = currentTask?.todoChecklist || [];
                const matchedTask = prevTodoChecklist.find((task) => task.text == item);
                return {
                    text: item,
                    completed: matchedTask ? matchedTask.completed : false,
                };
            });

            await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
                ...taskData,
                dueDate: new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist,
            });

            toast.success("Задача успешно обновлена");
        } catch (error) {
            console.error("Ошибка при обновлении задачи:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        if (!taskData.title.trim()) return setError("Введите название задачи");
        if (!taskData.description.trim()) return setError("Введите описание");
        if (!taskData.dueDate) return setError("Укажите срок выполнения");
        if (taskData.assignedTo?.length === 0) return setError("Выберите исполнителей");
        if (taskData.todoChecklist?.length === 0) return setError("Добавьте хотя бы один пункт");

        taskId ? updateTask() : createTask();
    };

    const getTaskDetailsByID = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
            if (response.data) {
                const taskInfo = response.data;
                setCurrentTask(taskInfo);
                setTaskData({
                    title: taskInfo.title,
                    description: taskInfo.description,
                    priority: taskInfo.priority,
                    dueDate: taskInfo.dueDate ? moment(taskInfo.dueDate).format("YYYY-MM-DD") : null,
                    assignedTo: taskInfo.assignedTo?.map((i) => i?._id) || [],
                    todoChecklist: taskInfo.todoChecklist?.map((i) => i?.text) || [],
                    attachments: taskInfo.attachments || [],
                });
            }
        } catch (error) {
            console.error("Ошибка при получении задачи:", error);
        }
    };

    const deleteTask = async () => {
        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
            setOpenDeleteAlert(false);
            toast.success("Задача удалена");
            navigate('/admin/tasks');
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };

    useEffect(() => {
        if (taskId) getTaskDetailsByID(taskId);
    }, [taskId]);

    return (
        <DashboardLayout activeMenu="Создать задачу">
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                    <div className="form-card col-span-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-xl font-medium">
                                {taskId ? "Редактировать задачу" : "Создать задачу"}
                            </h2>
                            {taskId && (
                                <button
                                    className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                                    onClick={() => setOpenDeleteAlert(true)}
                                >
                                    <LuTrash2 className="text-base"/> Удалить
                                </button>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="text-xs font-medium text-slate-600">
                                Название задачи
                            </label>
                            <input
                                placeholder="Введите название задачи"
                                className="form-input"
                                value={taskData.title}
                                onChange={({target}) => handleValueChange("title", target.value)}
                            />
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">
                                Описание
                            </label>
                            <textarea
                                placeholder="Опишите задачу"
                                className="form-input"
                                rows={4}
                                value={taskData.description}
                                onChange={({target}) => handleValueChange("description", target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-12 gap-4 mt-2">
                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">
                                    Приоритет
                                </label>
                                <SelectDropdown
                                    options={PRIORITY_DATA}
                                    value={taskData.priority}
                                    onChange={(value) => handleValueChange("priority", value)}
                                    placeholder="Выберите приоритет"
                                />
                            </div>

                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">
                                    Срок выполнения
                                </label>
                                <input
                                    className="form-input"
                                    value={taskData.dueDate || ""}
                                    onChange={({target}) => handleValueChange("dueDate", target.value)}
                                    type="date"
                                />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <label className="text-xs font-medium text-slate-600">
                                    Исполнители
                                </label>
                                <SelectUsers
                                    selectedUsers={taskData.assignedTo}
                                    setSelectedUsers={(value) => {
                                        handleValueChange("assignedTo", value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">
                                Список задач
                            </label>
                            <TodoListInput
                                todoList={taskData?.todoChecklist}
                                setTodoList={(value) => handleValueChange("todoChecklist", value)}
                            />
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">
                                Вложения
                            </label>
                            <AddAttachmentsInput
                                attachments={taskData?.attachments}
                                setAttachments={(value) => handleValueChange("attachments", value)}
                            />
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
                        )}

                        <div className="flex justify-end mt-7">
                            <button
                                className="add-btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {taskId ? "СОХРАНИТЬ ИЗМЕНЕНИЯ" : "СОЗДАТЬ ЗАДАЧУ"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Удаление задачи"
            >
                <DeleteAlert
                    content="Вы уверены, что хотите удалить эту задачу?"
                    onDelete={() => deleteTask()}
                />
            </Modal>
        </DashboardLayout>
    );
};
