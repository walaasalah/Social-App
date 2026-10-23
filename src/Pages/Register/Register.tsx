import { Spinner } from "@heroui/react";
import {
  AtSign,
  CalendarDays,
  KeyRound,
  UserRound,
  UsersRound,
} from "lucide-react";
import AuthField, {
  authInputClass,
} from "../../Components/AuthIntro/AuthField";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import {
  registerschema,
  type RegisterSchemaType,
} from "../../lib/Schema/Auth.Schema";
import { RegisterUser } from "../../Services/Auth.services";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: zodResolver(registerschema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      password: "",
      rePassword: "",
    },
  });
  async function submitData(values: RegisterSchemaType) {
    // seterrorsmsg("");
    // setsuccessmsg("");
    try {
      const response = await RegisterUser(values);
      toast.success(response.data.message, {
        duration: 800,
        position: "top-center",
        // style:{background:"red",color:"white"}
      });
      //setsuccessmsg(response.data.message);
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
        //  seterrorsmsg(error.response?.data.message);
      }
    }
  }

  return (
    <section aria-labelledby="register-heading">
      <h1
        id="register-heading"
        className="text-2xl font-extrabold tracking-tight text-slate-900"
      >
        Create a new account
      </h1>
      <p className="mt-1 text-[13px] text-slate-500">It is quick and easy.</p>
      <form
        className="mt-5 space-y-3.5"
        onSubmit={handleSubmit(submitData)}
        noValidate
      >
        <AuthField
          icon={UserRound}
          {...register("name")}
          autoComplete="name"
          aria-label="Full name"
          placeholder="Full name"
          error={errors.name?.message}
          disabled={isSubmitting}
        />
        <AuthField
          icon={AtSign}
          {...register("username")}
          autoComplete="username"
          aria-label="Username"
          placeholder="Username"
          error={errors.username?.message}
          disabled={isSubmitting}
        />
        <AuthField
          icon={AtSign}
          {...register("email")}
          type="email"
          autoComplete="email"
          aria-label="Email address"
          placeholder="Email address"
          error={errors.email?.message}
          disabled={isSubmitting}
        />
        <div>
          <div className="relative">
            <UsersRound
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-[17px] text-slate-400"
            />
            <select
              {...register("gender")}
              aria-label="Gender"
              aria-invalid={Boolean(errors.gender)}
              aria-describedby={errors.gender ? "gender-error" : undefined}
              disabled={isSubmitting}
              className={authInputClass}
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          {errors.gender && (
            <p
              id="gender-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {errors.gender.message}
            </p>
          )}
        </div>
        <AuthField
          icon={CalendarDays}
          {...register("dateOfBirth")}
          type="date"
          autoComplete="bday"
          aria-label="Date of birth"
          error={errors.dateOfBirth?.message}
          disabled={isSubmitting}
        />
        <AuthField
          icon={KeyRound}
          {...register("password")}
          type="password"
          autoComplete="new-password"
          aria-label="Password"
          placeholder="Password"
          error={errors.password?.message}
          disabled={isSubmitting}
        />
        <AuthField
          icon={KeyRound}
          {...register("rePassword")}
          type="password"
          autoComplete="new-password"
          aria-label="Confirm password"
          placeholder="Confirm password"
          error={errors.rePassword?.message}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-main px-4 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="text-white" />
              Creating account...
            </>
          ) : (
            "Create New Account"
          )}
        </button>
      </form>
    </section>
  );
}
