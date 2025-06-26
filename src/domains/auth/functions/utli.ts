import { setItem } from "@/shared/utlis/localStorage";
import { useForm } from "@tanstack/react-form";
import { FormValues } from "../types/types";

export const handleFormSubmit =
  (form: ReturnType<typeof useForm<FormValues>>) =>
  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

export const handleOnSubmit = async ({ value }: { value: FormValues }) => {
  setItem("auth", value);
};
