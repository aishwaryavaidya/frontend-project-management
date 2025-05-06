"use client";

import { Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import Image from "next/image";

import { LoginProps } from "@/types/types";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = params.get("returnUrl") || "/dashboard/summary";

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<LoginProps>();

  async function onSubmit(data: LoginProps) {
    try {
      setLoading(true);
      setError("");
      console.log("Attempting to sign in with credentials:", data);
      
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        router.push(returnUrl);
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full py-5 lg:px-8 px-6 mb-8">
      <div className="">
        <div className="ml-20">
          <Image 
            src="https://autoplant.in/assets/img/logoautoplant.svg"
            alt="" 
            width={200}
            height={50}
          />
        </div>

        <div className="py-4 text-gray-900 justify-between items-center dark:text-gray-50">
          <h2 className="text-xl lg:text-xl font-bold leading-9 tracking-tight">
            Sign in to Dashboard
          </h2>
          <p className="text-xs">Welcome Back, fill in details to login</p>
        </div>
      </div>

      <div className="">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            register={register}
            errors={errors}
            label="Employee Code"
            name="employee_code"
            icon={Mail}
            placeholder="Employee Code"
          />
          
          <PasswordInput
            register={register}
            errors={errors}
            label="Password"
            name="password"
            icon={Lock}
            placeholder="Password"
            forgotPasswordLink="/forgot-password"
          />

          <div>
            <SubmitButton
              title="Sign In"
              loadingTitle="Loading Please wait.."
              loading={loading}
              className="w-full"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Not a Registered ?{" "}
          <Link
            href="/register"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
