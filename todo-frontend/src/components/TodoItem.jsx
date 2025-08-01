import { useState } from "react";
import { Trash2, CheckCircle2, Circle, Clock, Calendar } from "lucide-react";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  isUpdating = false,
  showPriority = true,
  showDate = true,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = async () => {
    if (isUpdating || isDeleting) return;
    await onToggle(todo.id);
  };

  const handleDelete = async () => {
    if (isUpdating || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 1) return `In ${diffDays} days`;

    return date.toLocaleDateString();
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <div
      className={`group relative bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out
        ${todo.completed ? "bg-gray-50 border-gray-100" : "hover:border-blue-200"}
        ${isOverdue ? "border-red-200 bg-red-50" : ""}
        ${isUpdating || isDeleting ? "opacity-60 pointer-events-none" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isUpdating || isDeleting) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 transition-all duration-200 ease-in-out
            ${todo.completed ? "bg-green-500 border-green-500 text-white shadow-sm" : "border-gray-300 hover:border-green-400 hover:bg-green-50"}
            ${isUpdating || isDeleting ? "cursor-not-allowed" : "cursor-pointer"}
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          `}
        >
          {todo.completed ? (
            <CheckCircle2 size={12} className="m-auto" />
          ) : (
            <Circle size={12} className="m-auto opacity-0 group-hover:opacity-30" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`text-sm font-medium leading-5 transition-all duration-200
              ${todo.completed ? "text-gray-500 line-through" : isOverdue ? "text-red-900" : "text-gray-900"}
            `}>
              {todo.title}
            </h3>
            {showPriority && todo.priority && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
                {todo.priority}
              </span>
            )}
          </div>

          {todo.description && (
            <p className={`text-xs leading-4 mb-2 ${todo.completed ? "text-gray-400" : "text-gray-600"}`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {showDate && todo.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                <Calendar size={12} />
                <span>{formatDate(todo.dueDate)}</span>
                {isOverdue && !todo.completed && <span className="text-red-500 font-medium">• Overdue</span>}
              </div>
            )}

            {todo.createdAt && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Created {formatDate(todo.createdAt)}</span>
              </div>
            )}

            {todo.category && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {todo.category}
              </span>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1 transition-opacity duration-200 ${isHovered || todo.completed ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={handleDelete}
            className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200
              ${isUpdating || isDeleting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            `}
          >
            {isDeleting ? (
              <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      {todo.subtasks && todo.subtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Subtasks</span>
            <span>{todo.subtasks.filter((s) => s.completed).length} of {todo.subtasks.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${(todo.subtasks.filter((s) => s.completed).length / todo.subtasks.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
