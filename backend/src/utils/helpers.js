import { ZodError } from "zod";

export const formatZodError = (error) => {
  if (error instanceof ZodError) {
    return error.errors.map((e) => e.message).join(", ");
  }
  return "Données invalides";
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
