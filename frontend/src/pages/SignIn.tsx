import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

import FormInput from "../components/Form/FormInput";
import FormButton from "../components/Form/FormButton";
import { useAuthStore } from "../store/useAuthStore";
import FormDistraction from "../components/Form/FormDistraction";
import { SignInSchema } from "../lib/schemas/schemas";

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<z.core.$ZodIssue[] | null>(null);

  const navigate = useNavigate();

  const { signIn, isSigningIn } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validated = z.safeParse(SignInSchema, {
      email: formData.email,
      password: formData.password,
    });

    if (validated.error) {
      setFormError(validated.error.issues);
      return;
    }

    signIn({ email: validated.data.email, password: validated.data.password });
  };

  return (
    <div
      className="
      w-full
      min-h-screen
      bg-secondary
      px-2 sm:px-4 md:px-8 lg:px-20
      py-2 sm:py-4 md:py-8 lg:py-20
      flex flex-col-reverse lg:flex-row
      justify-center lg:justify-between items-center"
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
            <FormInput
              placeholder="Password"
              inputFor="password"
              formData={formData}
              setFormData={setFormData}
              formError={formError}
            />
          </div>
          <FormButton placeholder="Sign In" loading={isSigningIn} />
        </form>
        <div className="my-2">
          <p
            className="text-label-brighter-text hover:text-label-text text-sm sm:text-md font-bold text-center duration-150 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot a password
          </p>
          <p className="text-label-text text-sm sm:text-md text-center mt-2.5">
            Don't have an account?{" "}
            <span
              className="text-label-brighter-text font-bold cursor-pointer hover:text-label-text"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
      <FormDistraction
        header="Welcome back!"
        description="We have been waiting for you so long"
      />
    </div>
  );
};

export default SignIn;
