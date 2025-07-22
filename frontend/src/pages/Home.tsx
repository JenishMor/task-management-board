import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBoards, createBoard, deleteBoard } from "../utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";
import type { ApiError, Board } from "../types";

const boardSchema = z.object({
  name: z.string().min(2, "Board name must be at least 2 characters"),
  description: z.string().optional(),
});

type BoardFormData = z.infer<typeof boardSchema>;

interface ErrorResponse {
  response?: {
    data: ApiError;
  };
}

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
  });

  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const createBoardMutation = useMutation({
    mutationFn: (data: BoardFormData) =>
      createBoard(data.name, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setIsModalOpen(false);
      reset();
      toast.success("Board created successfully");
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to create board");
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted successfully");
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.response?.data?.message || "Failed to delete board");
    },
  });

  const onSubmit = (data: BoardFormData) => {
    createBoardMutation.mutate(data);
  };

  return (
    <div className="h-full w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Boards</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage your project boards
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Board
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-12">
          <p className="text-sm text-gray-600">No boards found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first board
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board._id}
              className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this board?")
                    ) {
                      deleteBoardMutation.mutate(board._id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <button
                className="block w-full p-6 text-left"
                onClick={() => navigate(`/boards/${board._id}`)}
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {board.description}
                  </p>
                )}
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <span>
                    Created on {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Create New Board"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <Input
            label="Board Name"
            placeholder="Enter board name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Description"
            placeholder="Enter board description (optional)"
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
            <Button type="submit" isLoading={createBoardMutation.isPending}>
              Create Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export { Home };
