import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as z from "zod";

import FormInput from "../components/Form/FormInput";
import FormButton from "../components/Form/FormButton";
import { useAuthStore } from "../store/useAuthStore";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<z.core.$ZodIssue[] | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { resetPassword, isResetingPassword } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validated = z.safeParse(
      z.object({
        password: z
          .string()
          .min(6, { message: "Password must be at least 6 characters long" })
          .refine((val) => /[A-Z]/.test(val), {
            message: "Must include an uppercase letter",
          })
          .refine((val) => /[a-z]/.test(val), {
            message: "Must include a lowercase letter",
          })
          .refine((val) => /[0-9]/.test(val), { message: "Must include a number" }),
      }),
      {
        password: formData.password,
      },
    );

    if (validated.error) {
      setFormError(validated.error.issues);
      return;
    }

    resetPassword({ id: searchParams.get("id"), password: validated.data.password });

    setTimeout(() => navigate("/signin"), 1500);
  };

  return (
    <div
      className="
      w-full
      min-h-screen
      bg-secondary_dark
      px-2 sm:px-4 md:px-8 lg:px-20
      py-2 sm:py-4 md:py-8 lg:py-20
      flex flex-col lg:flex-row
      justify-center items-center gap-8"
    >
      <div className="flex flex-col w-full md:w-2/3 max-w-lg items-center justify-center scale-90 sm:scale-100">
        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col items-center justify-center gap-10 w-full my-6.5">
            <FormInput
              placeholder="Password"
              inputFor="password"
              formData={formData}
              setFormData={setFormData}
              formError={formError}
            />
          </div>
          <FormButton placeholder="Reset a password" loading={isResetingPassword} />
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
