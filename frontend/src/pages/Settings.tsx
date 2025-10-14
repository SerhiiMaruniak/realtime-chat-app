import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import * as z from "zod";

import { useAuthStore } from "../store/useAuthStore";
import FormInput from "../components/Form/FormInput";
import FormButton from "../components/Form/FormButton";
import { UpdateProfileSchema } from "../lib/schemas/schemas";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, updateProfile, isUpdatingProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<z.core.$ZodIssue[] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      formData.firstName === user?.firstName &&
      formData.lastName === user?.lastName &&
      !imagePreview
    )
      return;

    const validated = z.safeParse(UpdateProfileSchema, {
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (validated.error) {
      setFormError(validated.error.issues);
      return;
    }

    updateProfile({ profilePic: imagePreview, ...validated.data });
  };

  return (
    <div className="relative w-full h-full rounded-xl flex flex-col justify-start items-center p-8">
      <button
        className="duration-150 transition-all absolute top-2.5 left-2.5 cursor-pointer text-label-text hover:text-label-brighter-text"
        onClick={() => navigate("/")}
      >
        <X />
      </button>
      <div className="w-full h-full">
        <form
          noValidate
          className="w-ful h-full flex flex-col justify-center items-center gap-4"
          onSubmit={handleSubmit}
        >
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <img
              src={
                imagePreview
                  ? imagePreview
                  : user?.photoUrl !== ""
                  ? user?.photoUrl
                  : "avatar_placeholder.png"
              }
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              type="button"
              className="duration-150 transition-all absolute bg-label-text hover:bg-spec-1-dark rounded-full p-1.5 bottom-0 right-0 cursor-pointer group"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <Camera
                className="duration-150 transition-all text-spec-1-dark group-hover:text-label-text"
                size={20}
              />
            </button>
          </div>
          <div className="flex flex-col justufy-center items-center gap-6 w-full md:w-1/3">
            <div className="flex flex-col justify-center items-center gap-5 w-full">
              <FormInput
                placeholder="First Name"
                inputFor="firstName"
                formData={formData}
                setFormData={setFormData}
                formError={formError}
              />
              <FormInput
                placeholder="Last Name"
                inputFor="lastName"
                formData={formData}
                setFormData={setFormData}
                formError={formError}
              />
            </div>
            <FormButton placeholder="Update Profile" loading={isUpdatingProfile} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
