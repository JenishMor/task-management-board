import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { resetPassword } from "../utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import type { ApiError } from "../types";

const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email, data.newPassword);
      toast.success("Password reset successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      const apiError = error as { response?: { data: ApiError } };
      toast.error(
        apiError.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
            <div>
              <Input
                id="newPassword"
                type="password"
                placeholder="New password"
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />
            </div>
            <div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
