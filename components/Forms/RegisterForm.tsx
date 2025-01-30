"use client";
import { Eye, EyeOff, Headset, Loader2, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserProps } from "@/types/types";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { createUser } from "@/actions/users";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { Button } from "../ui/button";
import Image from "next/image";
// import { FaGithub, FaGitter, FaGoogle } from "react-icons/fa";
import { createUser } from "@/actions/users";
import { signIn } from "next-auth/react";
export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<UserProps>();
  const router = useRouter();
  async function onSubmit(data: UserProps) {
    setLoading(true);
    data.name = `${data.firstName} ${data.lastName}`;
    try {
      const res = await createUser(data);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Account Created successfully");
        router.push("/login");
      } else {
        setLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("Its seems something is wrong, try again");
    }
  }
  return (
    <div className="w-full py-5 lg:px-8 px-6 dark:bg-neutral-900 dark:text-gray-50">
      <div className="flex justify-center items-center">
      <Image 
            src="https://autoplant.in/assets/img/logoautoplant.svg"
            alt="" 
            width={200}
            height={50}/>
      </div>
      <div className="">
        <div className="py-4 ">
          <h2 className="text-xl lg:text-2xl font-bold leading-9 tracking-tight  ">
            Create an account 
          </h2>
          <p className="text-xs">Join Us, fill in details to login</p>
        </div>
      </div>
      <div className="">
        <form className="space-y-3 dark:text-white-100" onSubmit={handleSubmit(onSubmit) }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <TextInput
              register={register}
              errors={errors}
              label="First Name"
              name="firstName"
              icon={User}
              placeholder="First Name"
            />
            <TextInput
              register={register}
              errors={errors}
              label="Last Name"
              name="lastName"
              icon={User}
              placeholder="Last Name"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              register={register}
              errors={errors}
              label="Phone"
              name="phone"
              icon={Headset}
              placeholder="+91|Phone"
            />
            <div className="">
              <TextInput
                type="email"
                register={register}
                errors={errors}
                label="Email Address"
                name="email"
                icon={Mail}
                placeholder="email"
              />
              {emailErr && (
                <p className="text-red-500 text-xs mt-2">{emailErr}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
                type="employeeid"
                register={register}
                errors={errors}
                label="Employee Id"
                name="employeeId"
                icon={User}
                placeholder="e.g. AP0649"
              />

            <div className="">
            <PasswordInput
            register={register}
            errors={errors}
            label="Password"
            name="password"
            icon={Lock}
            placeholder="Password"
            type="password"
          />
            </div>
          </div>
          
          <div>
            <SubmitButton
              title="Sign Up"
              loadingTitle="Creating Please wait.."
              loading={loading}
              className="w-full"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </div>
        </form>

        {/* <div className="flex items-center py-4 justify-center space-x-1 text-slate-900">
          <div className="h-[1px] w-full bg-slate-200"></div>
          <div className="uppercase">Or</div>
          <div className="h-[1px] w-full bg-slate-200"></div>
        </div> */}

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Button
            onClick={() => signIn("google")}
            variant={"outline"}
            className="w-full"
          >
            <FaGoogle className="mr-2 w-6 h-6 text-red-500" />
            Signup with Google
          </Button>
          <Button
            onClick={() => signIn("github")}
            variant={"outline"}
            className="w-full"
          >
            <FaGithub className="mr-2 w-6 h-6 text-slate-900 dark:text-white" />
            Signup with Github
          </Button>
        </div> */}

        <p className="mt-6 text-left text-sm text-gray-500 dark:text-gray-50">
          Alrealy Registered ?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
