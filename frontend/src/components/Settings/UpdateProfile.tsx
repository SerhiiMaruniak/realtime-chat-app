import React, { useRef, useState } from "react";
import * as z from "zod";
import { Camera } from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import FormInput from "../../components/Form/FormInput";
import FormButton from "../../components/Form/FormButton";
import { UpdateProfileSchema } from "../../lib/schemas/schemas";

const UpdateProfile = () => {
  const { user, updateProfile, isUpdatingProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<z.core.$ZodIssue[] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (formData.username === user?.username && !imagePreview) return;

    const validated = z.safeParse(UpdateProfileSchema, {
      username: formData.username,
    });

    if (validated.error) {
      setFormError(validated.error.issues);
      return;
    }

    updateProfile({ profilePic: imagePreview, ...validated.data });
  };

  return (
    <div className="w-full">
      <form
        noValidate
        className="w-full flex flex-col justify-center items-center gap-4"
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
            className="duration-150 transition-all absolute bg-label-text hover:bg-spec-1 rounded-full p-1.5 bottom-0 right-0 cursor-pointer group"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            <Camera
              className="duration-150 transition-all text-spec-1 group-hover:text-label-text"
              size={20}
            />
          </button>
        </div>
        <div className="flex flex-col justufy-center items-center gap-6 w-full">
          <div className="flex flex-col justify-center items-center gap-5 w-full">
            <FormInput
              placeholder="First Name"
              inputFor="username"
              formData={formData}
              setFormData={setFormData}
              formError={formError}
            />
          </div>
          <FormButton placeholder="Update Profile" loading={isUpdatingProfile} />
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
