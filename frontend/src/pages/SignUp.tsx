import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

import FormInput from "../components/Form/FormInput";
import FormButton from "../components/Form/FormButton";
import { useAuthStore } from "../store/useAuthStore";
import FormDistraction from "../components/Form/FormDistraction";
import { SignUpSchema } from "../lib/schemas/schemas";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<z.core.$ZodIssue[] | null>(null);

  const navigate = useNavigate();

  const { signUp, isSigningUp } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validated = z.safeParse(SignUpSchema, {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (validated.error) {
      setFormError(validated.error.issues);
      return;
    }

    signUp({
      username: validated.data.username,
      email: validated.data.email,
      password: validated.data.password,
    });
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
      justify-center lg:justify-between items-center"
    >
      <div className="flex flex-col w-full md:w-2/3 max-w-lg items-center justify-center scale-90 sm:scale-100">
        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col items-center justify-center gap-6 w-full my-6">
            <FormInput
              placeholder="Username"
              inputFor="username"
              formData={formData}
              setFormData={setFormData}
              formError={formError}
            />
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
          <FormButton placeholder="Sign Up" loading={isSigningUp} />
        </form>
        <p className="text-label-text text-sm sm:text-md text-center my-2">
          Already have an account?{" "}
          <span
            className="text-label-brighter-text font-bold cursor-pointer hover:text-label-text"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
      <FormDistraction
        header="Become a part of us today!"
        description="Join millions of users right now"
      />
    </div>
  );
};

export default SignUp;
