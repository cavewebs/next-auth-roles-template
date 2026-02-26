import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/shared/icons";
import { toast } from "sonner";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { register as registerAction } from "@/actions/register";

function SignInModal({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onLogin(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);

    const result = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      return toast.error("Invalid email or password.", {
        description: "Please check your credentials and try again.",
      });
    }

    if (result?.ok) {
      setShowSignInModal(false);
      window.location.href = "/dashboard";
    }
  }

  async function onRegister(data: z.infer<typeof registerSchema>) {
    setIsLoading(true);

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
      callbackUrl: "/dashboard",
    });

    setShowSignInModal(false);
  }

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a>
          <h3 className="font-satoshi text-2xl font-black">Welcome</h3>
          <p className="text-sm text-gray-500">
            Sign in or create an account to continue
          </p>
        </div>

        <div className="bg-secondary/50 px-4 py-6 md:px-16">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="grid gap-3"
              >
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="login-email">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || isGoogleLoading}
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors?.email && (
                    <p className="px-1 text-xs text-red-600">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="login-password">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading || isGoogleLoading}
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors?.password && (
                    <p className="px-1 text-xs text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="grid gap-3"
              >
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="register-name">
                    Name
                  </Label>
                  <Input
                    id="register-name"
                    placeholder="Your name"
                    type="text"
                    autoComplete="name"
                    disabled={isLoading || isGoogleLoading}
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors?.name && (
                    <p className="px-1 text-xs text-red-600">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="register-email">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || isGoogleLoading}
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors?.email && (
                    <p className="px-1 text-xs text-red-600">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="register-password">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    placeholder="Create a password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading || isGoogleLoading}
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors?.password && (
                    <p className="px-1 text-xs text-red-600">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-secondary/50 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={isLoading || isGoogleLoading}
            onClick={() => {
              setIsGoogleLoading(true);
              signIn("google", { redirect: false }).then(() =>
                setTimeout(() => {
                  setShowSignInModal(false);
                }, 400),
              );
            }}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}{" "}
            Google
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({
      setShowSignInModal,
      SignInModal: SignInModalCallback,
    }),
    [setShowSignInModal, SignInModalCallback],
  );
}
