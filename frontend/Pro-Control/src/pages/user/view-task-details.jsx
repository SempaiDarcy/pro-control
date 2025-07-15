import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axios-instance.js";
import { API_PATHS } from "../../utils/api-paths.js";
import { DashboardLayout } from "../../components/layouts/dashboard-layout.jsx";
import { AvatarGroup } from "../../components/avatar-group.jsx";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

export const ViewTaskDetails = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);

    const getStatusTagColor = (status) => {
        switch (status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
            case "Completed":
                return "text-lime-500 bg-lime-50 border border-lime-500/20";
            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "In Progress":
                return "В процессе";
            case "Completed":
                return "Завершено";
            case "Pending":
                return "Ожидает";
            default:
                return status;
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case "High":
                return "Высокий";
            case "Medium":
                return "Средний";
            case "Low":
                return "Низкий";
            default:
                return priority;
        }
    };

    const getFormattedDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getTaskDetailsByID = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
            if (response.data) {
                setTask(response.data);
            }
        } catch (error) {
            console.error("Ошибка при получении задачи:", error);
        }
    };

    const updateTodoChecklist = async (index) => {
        const todoChecklist = [...task?.todoChecklist];
        const taskId = id;

        if (todoChecklist && todoChecklist[index]) {
            todoChecklist[index].completed = !todoChecklist[index].completed;

            try {
                const response = await axiosInstance.put(
                    API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
                    { todoChecklist }
                );
                if (response.status === 200) {
                    setTask(response.data?.task || task);
                } else {
                    todoChecklist[index].completed = !todoChecklist[index].completed;
                }
            } catch (error) {
                todoChecklist[index].completed = !todoChecklist[index].completed;
            }
        }
    };

    const handleLinkClick = (link) => {
        if (!/^https?:\/\//i.test(link)) {
            link = "https://" + link;
        }
        window.open(link, "_blank");
    };

    useEffect(() => {
        if (id) {
            getTaskDetailsByID();
        }
    }, [id]);

    return (
        <DashboardLayout activeMenu="Мои задачи">
            <div className="mt-5">
                {task && (
                    <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                        <div className="form-card col-span-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm md:text-xl font-medium">{task?.title}</h2>
                                <div
                                    className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                                        task?.status
                                    )} px-4 py-0.5 rounded`}
                                >
                                    {getStatusLabel(task?.status)}
                                </div>
                            </div>

                            <div className="mt-4">
                                <InfoBox label="Описание" value={task?.description} />
                            </div>

                            <div className="grid grid-cols-12 gap-4 mt-4">
                                <div className="col-span-6 md:col-span-4">
                                    <InfoBox label="Приоритет" value={getPriorityLabel(task?.priority)} />
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <InfoBox
                                        label="Срок выполнения"
                                        value={task?.dueDate ? getFormattedDate(task?.dueDate) : "Н/Д"}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <label className="text-xs font-medium text-slate-500">
                                        Ответственные
                                    </label>
                                    <AvatarGroup
                                        avatars={
                                            task?.assignedTo?.map((item) => item?.profileImageUrl) || []
                                        }
                                        names={task?.assignedTo?.map((item) => item?.name)}
                                        maxVisible={5}
                                    />
                                </div>
                            </div>

                            <div className="mt-2">
                                <label className="text-xs font-medium text-slate-500">Чеклист задач</label>
                                {task?.todoChecklist?.map((item, index) => (
                                    <TodoCheckList
                                        key={`todo_${index}`}
                                        text={item.text}
                                        isChecked={item?.completed}
                                        onChange={() => updateTodoChecklist(index)}
                                    />
                                ))}
                            </div>

                            {task?.attachments?.length > 0 && (
                                <div className="mt-2">
                                    <label className="text-xs font-medium text-slate-500">Вложения</label>
                                    {task?.attachments?.map((link, index) => (
                                        <Attachment
                                            key={`link_${index}`}
                                            link={link}
                                            index={index}
                                            onClick={() => handleLinkClick(link)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

const InfoBox = ({ label, value }) => (
    <>
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">{value}</p>
    </>
);

const TodoCheckList = ({ text, isChecked, onChange }) => (
    <div className="flex items-center gap-3 p-3">
        <input
            type="checkbox"
            checked={isChecked}
            onChange={onChange}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
        />
        <p className="text-[13px] text-gray-800">{text}</p>
    </div>
);

const Attachment = ({ link, index, onClick }) => (
    <div
        className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
        onClick={onClick}
    >
        <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold mr-2">
                {index < 9 ? `0${index + 1}` : index + 1}
            </span>
            <p className="text-xs text-black">{link}</p>
        </div>
        <LuSquareArrowOutUpRight className="text-gray-400" />
    </div>
);
