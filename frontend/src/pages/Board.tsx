import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  getBoard,
  getTasks,
  createTask,
  deleteTask,
  moveTask,
} from "../utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import type { ApiError, Task, Board as BoardType } from "../types";
import { Trash2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface ErrorResponse {
  response?: {
    data: ApiError;
  };
}

const COLUMNS = [
  { id: "todo", name: "To Do", color: "bg-gray-100" },
  { id: "in_progress", name: "In Progress", color: "bg-blue-50" },
  { id: "completed", name: "Completed", color: "bg-green-50" },
  { id: "blocked", name: "Blocked", color: "bg-red-50" },
] as const;

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onDelete }: TaskItemProps) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<
    { id: string; status: Task["status"]; order: number },
    void,
    { isDragging: boolean }
  >(() => ({
    type: "task",
    item: { id: task._id, status: task.status, order: task.order },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(dragRef);

  return (
    <div
      ref={dragRef}
      className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <button
        onClick={() => {
          if (confirm("Are you sure you want to delete this task?")) {
            onDelete(task._id);
          }
        }}
        className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <h4 className="font-medium text-gray-900 pr-8">{task.title}</h4>
      {task.description && (
        <p className="mt-2 text-sm text-gray-600">{task.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            created on: {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ColumnProps {
  title: string;
  status: Task["status"];
  tasks: Task[];
  color: string;
  onDrop: (taskId: string, newStatus: Task["status"], newOrder: number) => void;
  onDelete: (id: string) => void;
}

const Column = ({
  title,
  status,
  tasks,
  color,
  onDrop,
  onDelete,
}: ColumnProps) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop<
    { id: string; status: Task["status"]; order: number },
    void,
    { isOver: boolean }
  >(() => ({
    accept: "task",
    drop: (item) => {
      if (item.status !== status) {
        const tasksInColumn = tasks.filter((t) => t.status === status);
        onDrop(item.id, status, tasksInColumn.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  drop(dropRef);

  const columnTasks = tasks.filter((task) => task.status === status);

  return (
    <div
      ref={dropRef}
      className={`flex h-full flex-col rounded-lg ${color} p-4 ${
        isOver ? "ring-2 ring-indigo-500" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600">
          {columnTasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto">
        {columnTasks.map((task) => (
          <TaskItem key={task._id} task={task} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

const Board = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const { data: board } = useQuery<BoardType>({
    queryKey: ["board", id],
    queryFn: () => getBoard(id!),
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks", id],
    queryFn: () => getTasks(id!),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      createTask(data.title, id!, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      setIsModalOpen(false);
      reset();
      toast.success("Task created successfully");
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to create task");
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      newStatus,
      newOrder,
    }: {
      taskId: string;
      newStatus: Task["status"];
      newOrder: number;
    }) => moveTask(taskId, newStatus, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to move task");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      toast.success("Task deleted successfully");
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to delete task");
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const handleDrop = (
    taskId: string,
    newStatus: Task["status"],
    newOrder: number
  ) => {
    moveTaskMutation.mutate({ taskId, newStatus, newOrder });
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{board?.name}</h1>
          {board?.description && (
            <p className="mt-1 text-sm text-gray-600">{board.description}</p>
          )}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Task</Button>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              title={column.name}
              status={column.id}
              color={column.color}
              tasks={tasks}
              onDrop={handleDrop}
              onDelete={(id) => deleteTaskMutation.mutate(id)}
            />
          ))}
        </div>
      </DndProvider>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Add Task"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <Input
            id="title"
            label="Task title"
            placeholder="Enter task title"
            {...register("title")}
            error={errors.title?.message}
          />
          <Input
            id="description"
            label="Description"
            placeholder="Enter task description (optional)"
            {...register("description")}
            error={errors.description?.message}
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export { Board };
