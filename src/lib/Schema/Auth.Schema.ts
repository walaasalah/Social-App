import * as z from "zod";

export const registerschema = z
  .object({
    name: z
      .string()
      .nonempty("name is requied")
      .min(3, "min char is 3")
      .max(10, "max char is 10"),
    username: z
      .string()
      .nonempty("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscore",
      ),
    email: z.string().nonempty("Email is requied").email("Email is not Valid"),
    dateOfBirth: z
      .string()
      .nonempty("Date of Birth is requied")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 18;
      }, "User must be order than 18"),
    gender: z.string().nonempty("Gender is requied"),
    password: z
      .string()
      .nonempty("password is requied")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    rePassword: z.string().nonempty("rePassword is requied"),
  })
  .refine(
    (data) => {
      return data.password === data.rePassword;
    },
    {
      path: ["rePassword"],
      message: "Password not much",
    },
  );

export type RegisterSchemaType = z.infer<typeof registerschema>;

//---------login

export const loginschema = z.object({
  email: z.string().nonempty("Email is requied").email("Email is not Valid"),

  password: z
    .string()
    .nonempty("password is requied")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
});

export type LoginSchemaType = z.infer<typeof loginschema>;

export const changePasswordSchema = z
  .object({
    password: z.string().nonempty("Enter your current password."),
    newPassword: z
      .string()
      .nonempty("Enter a new password.")
      .min(8, "Password must be at least 8 characters.")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,}$/,
        "Password must contain uppercase, lowercase, a number, and a special character.",
      ),
    confirmPassword: z.string().nonempty("Confirm your new password."),
  })
  .refine((data) => data.newPassword !== data.password, {
    path: ["newPassword"],
    message: "Choose a different password from your current one.",
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
