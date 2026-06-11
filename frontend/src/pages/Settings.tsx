import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore";
import FormInput from "../components/Form/FormInput";
import FormButton from "../components/Form/FormButton";
import { UpdateProfileSchema } from "../lib/schemas/schemas";

const Settings = () => {
  const { user, updateProfile, isUpdatingProfile, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    username: user?.username || "",
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
    <div className="w-full h-full rounded-xl flex flex-col justify-start items-center p-1 sm:p-5.5">
      <div className="flex flex-col justify-start items-center gap-4.5 max-w-[1444px] w-full h-full sm:bg-secondary_dark px-3.5 py-4 rounded-md">
        <div className="w-full h-auto flex justify-start items-center">
          <button
            className="duration-150 transition-all cursor-pointer text-label-text hover:text-label-brighter-text"
            onClick={() => navigate("/")}
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col items-center justify-start gap-10.5 w-full sm:w-1/2 h-full overflow-y-auto">
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
          <div className="w-full">
            <button
              className="w-full h-[52px] duration-150 transition-all cursor-pointer rounded-sm bg-spec-1-dark text-label-text hover:bg-red-800 hover:text-red-200 font-semibold"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
