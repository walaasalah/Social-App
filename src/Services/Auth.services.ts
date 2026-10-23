import axios from "axios";
import type {
  LoginSchemaType,
  RegisterSchemaType,
} from "../lib/Schema/Auth.Schema";

const baseUrl = import.meta.env.VITE_BASE_URL;

export function RegisterUser(values: RegisterSchemaType) {
  return axios.post(`${baseUrl}/users/signup`, values);
}

export function LoginUser(values: LoginSchemaType) {
  return axios.post(`${baseUrl}/users/signin`, values);
}

export function ChangePassword(values: { password: string; newPassword: string }) {
  return axios.patch(`${baseUrl}/users/change-password`, values, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
}
