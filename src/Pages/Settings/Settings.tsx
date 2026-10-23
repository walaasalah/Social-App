import axios from "axios";
import { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordSchemaType } from "../../lib/Schema/Auth.Schema";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { ChangePassword } from "../../Services/Auth.services";
import { TokenContext } from "../../Components/Context/TokenContext";

export default function Settings() {
  const tokenContext = useContext(TokenContext);
  const pending = useRef(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", newPassword: "", confirmPassword: "" },
  });

  async function updatePassword(values: ChangePasswordSchemaType) {
    if (pending.current) return;
    pending.current = true;
    setServerError("");

    try {
      const { data } = await ChangePassword({
        password: values.password,
        newPassword: values.newPassword,
      });
      const token = data.data?.token;
      if (token) {
        localStorage.setItem("userToken", token);
        tokenContext?.setToken(token);
      }
      reset();
      toast.success("Password updated successfully.");
    } catch (error) {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const message = typeof response?.message === "string" ? response.message : "";
      const incorrectPassword = response?.errors?.password ||
        /(?:incorrect|invalid|wrong).*(?:password|credentials)|password.*(?:incorrect|invalid|wrong)/i.test(message);

      if (incorrectPassword) {
        setError("password", { type: "server", message: "Incorrect password" }, { shouldFocus: true });
        return;
      }
      setServerError(message || "Could not update your password. Please try again.");
    } finally {
      pending.current = false;
    }
  }

  const inputClass = "mt-2 h-[60px] w-full rounded-2xl border border-[#dce4ef] bg-[#f7f9fc] px-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";

  return (
    <section aria-labelledby="settings-heading" className="mx-auto max-w-[840px] rounded-[22px] border border-[#dce4ef] bg-white p-5 shadow-[0_2px_3px_rgba(15,23,42,0.12)] sm:p-[30px]">
      <header className="mb-7 flex items-center gap-4">
        <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#e7f2ff] text-[#1682ff]">
          <KeyRound size={23} aria-hidden="true" />
        </span>
        <div>
          <h1 id="settings-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[30px]">Change Password</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Keep your account secure by using a strong password.</p>
        </div>
      </header>

      <form onSubmit={(event) => { void handleSubmit(updatePassword)(event); }} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-6">
          <div>
            <label htmlFor="current-password" className="block text-base font-semibold text-slate-700">Current password</label>
            <input id="current-password" type="password" autoComplete="current-password" placeholder="Enter current password" className={`${inputClass} bg-[#fffec5]!`} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "current-password-error" : undefined} {...register("password")} />
            {errors.password && <p id="current-password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="new-password" className="block text-base font-semibold text-slate-700">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" placeholder="Enter new password" className={inputClass} aria-invalid={Boolean(errors.newPassword)} aria-describedby="password-help new-password-error" {...register("newPassword")} />
            <p id="password-help" className="mt-1.5 text-sm leading-5 text-slate-500">At least 8 characters with uppercase, lowercase, number, and special character.</p>
            {errors.newPassword && <p id="new-password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-base font-semibold text-slate-700">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" placeholder="Re-enter new password" className={inputClass} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} {...register("confirmPassword")} />
            {errors.confirmPassword && <p id="confirm-password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{serverError}</p>}
          <button type="submit" className="h-[50px] w-full rounded-2xl bg-[#76a9f7] px-4 text-base font-bold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Updating password..." : "Update password"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}


