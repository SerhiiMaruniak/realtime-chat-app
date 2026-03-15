import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

import FormInput from "../components/Form/FormInput";
import FormButton from "../components/Form/FormButton";
import { useAuthStore } from "../store/useAuthStore";
import FormDistraction from "../components/Form/FormDistraction";

const ForgotPasword = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<z.core.$ZodIssue[] | null>(null);

  const navigate = useNavigate();

  const { forgotPassword, isForgetingPassword } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validated = z.safeParse(
      z.object({
        email: z.email("Should be a valid email"),
      }),
      {
        email: formData.email,
      },
    );

    if (validated.error) {
      setFormError(validated.error.issues);
      return;
    }

    forgotPassword({ email: validated.data.email });
  };

  return (
    <div
      className="
      w-full
      min-h-screen
      bg-secondary_dark
      px-2 sm:px-4 md:px-8 lg:px-20
      py-2 sm:py-4 md:py-8 lg:py-20
      flex flex-col-reverse lg:flex-row
      justify-center lg:justify-between items-center gap-8"
    >
      <div className="flex flex-col w-full md:w-2/3 max-w-lg items-center justify-center scale-90 sm:scale-100">
        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col items-center justify-center gap-10 w-full my-6.5">
            <FormInput
              placeholder="Email"
              inputFor="email"
              formData={formData}
              setFormData={setFormData}
              formError={formError}
            />
          </div>
          <FormButton placeholder="Send a reset link" loading={isForgetingPassword} />
        </form>
        <div className="my-2">
          <p className="text-label-text text-sm sm:text-md text-center mt-2.5">
            Remembered a password?{" "}
            <span
              className="text-label-brighter-text font-bold cursor-pointer hover:text-label-text"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
      <FormDistraction
        header="Forgot a password?"
        description="No worries, we are always here to help you"
      />
    </div>
  );
};

export default ForgotPasword;
