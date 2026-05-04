import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";

interface UserForm {
    username: string;
    password: string;
}

const SignInPage = () => {
  const [form, setForm] = useState<UserForm>({
    username: "",
    password: ""
  })

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    //TODO: Handle sign in
    console.log(form.username, form.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldSet className="w-full">
              <FieldGroup className="space-y-4">
                
                <Field className="space-y-1">
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="admin" 
                    required
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                  />
                </Field>

                <Field className="space-y-1">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                  />
                  <FieldDescription className="text-xs">
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>

                <Button type="submit" className="w-full mt-2">
                  Sign In
                </Button>

              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default SignInPage;