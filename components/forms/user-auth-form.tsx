"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { registerSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";
import { register as registerAction } from "@/actions/register";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const isRegister = type === "register";
  const [authMethod, setAuthMethod] = React.useState<
    "magic-link" | "credentials"
  >("credentials");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const searchParams = useSearchParams();

  const currentSchema = React.useMemo(() => {
    if (isRegister) return registerSchema;
    if (authMethod === "credentials") {
      return z.object({
        name: z.string().default(""),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(1, "Password is required"),
      });
    }
    return z.object({
      name: z.string().default(""),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().default(""),
    });
  }, [isRegister, authMethod]);

  type FormData = z.infer<typeof registerSchema>;

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(currentSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    reset({ name: "", email: "", password: "" });
  }, [authMethod, reset]);

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setIsLoading(true);

    if (isRegister) {
      const result = await registerAction({
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
      });

      if (result.error) {
        setIsLoading(false);
        return toast.error(result.error);
      }

      toast.success(result.success);

      await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        callbackUrl: searchParams?.get("from") || "/dashboard",
      });
      return;
    }

    if (authMethod === "magic-link") {
      const signInResult = await signIn("resend", {
        email: data.email.toLowerCase(),
        redirect: false,
        callbackUrl: searchParams?.get("from") || "/dashboard",
      });

      setIsLoading(false);

      if (!signInResult?.ok) {
        return toast.error("Something went wrong.", {
          description: "Your sign in request failed. Please try again.",
        });
      }

      return toast.success("Check your email", {
        description:
          "We sent you a login link. Be sure to check your spam too.",
      });
    }

    // Credentials login
    const signInResult = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    setIsLoading(false);

    if (signInResult?.error) {
      return toast.error("Invalid email or password.", {
        description: "Please check your credentials and try again.",
      });
    }

    if (signInResult?.ok) {
      window.location.href = searchParams?.get("from") || "/dashboard";
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {!isRegister && (
        <div className="flex items-center justify-center gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            className={cn(
              "w-full rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              authMethod === "credentials"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setAuthMethod("credentials")}
          >
            Password
          </button>
          <button
            type="button"
            className={cn(
              "w-full rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              authMethod === "magic-link"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setAuthMethod("magic-link")}
          >
            Magic Link
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          {isRegister && (
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                type="text"
                autoComplete="name"
                disabled={isLoading || isGoogleLoading}
                {...formRegister("name")}
              />
              {errors?.name && (
                <p className="px-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...formRegister("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {(isRegister || authMethod === "credentials") && (
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                placeholder={
                  isRegister ? "Create a password" : "Enter your password"
                }
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                disabled={isLoading || isGoogleLoading}
                {...formRegister("password")}
              />
              {errors?.password && (
                <p className="px-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {isRegister
              ? "Create Account"
              : authMethod === "credentials"
                ? "Sign In"
                : "Sign In with Email"}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() => {
          setIsGoogleLoading(true);
          signIn("google");
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}{" "}
        Google
      </button>
    </div>
  );
}
