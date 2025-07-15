import React from "react";
import { LuUser } from "react-icons/lu";

export const UserCard = ({ userInfo }) => {
  const {
    name,
    email,
    profileImageUrl,
    pendingTasks,
    inProgressTasks,
    completedTasks,
  } = userInfo;

  return (
      <div className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {profileImageUrl ? (
              <img
                  src={profileImageUrl}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
          ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <LuUser className="text-gray-400 text-xl" />
              </div>
          )}

          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-center text-[11px] font-medium">
          <StatCard label="Ожидают" count={pendingTasks || 0} status="Pending" />
          <StatCard label="В работе" count={inProgressTasks || 0} status="In Progress" />
          <StatCard label="Завершены" count={completedTasks || 0} status="Completed" />
        </div>
      </div>
  );
};

const StatCard = ({ label, count, status }) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-600 bg-cyan-50";
      case "Completed":
        return "text-indigo-600 bg-indigo-50";
      default:
        return "text-violet-600 bg-violet-50";
    }
  };

  return (
      <div className={`flex-1 px-3 py-1 rounded ${getStatusTagColor()}`}>
        <div className="text-[13px] font-semibold">{count}</div>
        <div>{label}</div>
      </div>
  );
};
