import { useEffect, useState } from "react";
import {
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import TodoItem from "./components/TodoItem";
import GeminiAsk from "./components/GeminiAsk";

const API_BASE = "http://localhost:5000/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      setIsAdding(true);
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      setTitle("");
    } catch (err) {
      setError("Failed to add task.");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleComplete = async (id) => {
    try {
      setUpdatingIds((prev) => new Set(prev).add(id));
      const target = todos.find((t) => t.id === id);
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !target.completed }),
      });
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError("Failed to update task.");
    } finally {
      setUpdatingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  };

  const deleteTodo = async (id) => {
    try {
      setUpdatingIds((prev) => new Set(prev).add(id));
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete task.");
    } finally {
      setUpdatingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isAdding) addTodo();
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>

        {totalCount > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {completedCount} of {totalCount} completed
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-3">
            <input
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isAdding}
            />
            <button
              onClick={addTodo}
              disabled={!title.trim() || isAdding}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-sm font-medium"
            >
              {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {isAdding ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 text-sm">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-0">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleComplete}
                onDelete={deleteTodo}
                isUpdating={updatingIds.has(todo.id)}
              />
            ))}
          </div>
        )}

        
        <div className="mt-10">
          <GeminiAsk />
        </div>
      </div>
    </div>
  );
}
