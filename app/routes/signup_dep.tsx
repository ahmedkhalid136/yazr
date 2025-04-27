import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

const messages = {
  "Invalid email": "Please enter a valid email address",
  "Invalid password": "Password must be at least 8 characters",
  "Invalid form data": "Please fill in all required fields",
  "User already exists": "An account with this email already exists",
  default: "An error occurred during signup",
};

export default function Signup() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <Form method="post" className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Create an Account</h1>
                  <p className="text-balance text-muted-foreground">
                    Join Yazr AI and start your journey
                  </p>
                </div>
                {actionData?.error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {messages[actionData.error as keyof typeof messages]}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    Password{" "}
                    <span className="text-xs text-gray-400">
                      min 8 characters
                    </span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="surname">Last Name</Label>
                    <Input
                      id="surname"
                      type="text"
                      name="surname"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    name="company"
                    placeholder="Acme Inc"
                    required
                  />
                </div>
                <Input type="hidden" name="register" value="true" />
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </div>
            </Form>
            <div className="relative hidden bg-gradient-to-br from-primary/20 to-primary/5 md:block"></div>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground mt-4 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By clicking create account, you agree to our{" "}
          <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  // try {
  //   console.log("signing up");
  //   const user = await authenticator.authenticate("register", request);

  //   const session = await getSession(request.headers.get("cookie"));
  //   session.set("user", user);
  //   return redirect("/dashboard", {
  //     headers: { "Set-Cookie": await commitSession(session) },
  //   });
  // } catch (error) {
  //   console.log("error", error);
  //   const errorMessage =
  //     error instanceof Error ? error.message : "Unknown error";
  //   return Response.json({ error: errorMessage || "Unknown error" });
  // }
  return null;
}
