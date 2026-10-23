import { Spinner } from "@heroui/react";
import { KeyRound, UserRound } from "lucide-react";
import AuthField from "../../Components/AuthIntro/AuthField";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import {
  loginschema,
  type LoginSchemaType,
} from "../../lib/Schema/Auth.Schema";
import { LoginUser } from "../../Services/Auth.services";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { TokenContext } from "../../Components/Context/TokenContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: zodResolver(loginschema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const tokenContext = useContext(TokenContext);
  async function submitData(values: LoginSchemaType) {
    try {
      const response = await LoginUser(values);

      const token = response.data.data.token;

      localStorage.setItem("userToken", token);
      tokenContext?.setToken(token);
      toast.success(response.data.message, {
        duration: 800,
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    }
  }

  return (
    <section aria-labelledby="login-heading">
      <h1
        id="login-heading"
        className="text-2xl font-extrabold tracking-tight text-slate-900"
      >
        Log in to Route Posts
      </h1>
      <p className="mt-1 text-[13px] text-slate-500">
        Log in and continue your social journey.
      </p>
      <form
        className="mt-5 space-y-3.5"
        onSubmit={handleSubmit(submitData)}
        noValidate
      >
        <AuthField
          icon={UserRound}
          {...register("email")}
          type="email"
          autoComplete="email"
          aria-label="Email address"
          placeholder="Email address"
          error={errors.email?.message}
          disabled={isSubmitting}
        />
        <AuthField
          icon={KeyRound}
          {...register("password")}
          type="password"
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Password"
          error={errors.password?.message}
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
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </button>
      </form>
    </section>
  );
}
