import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { auth } from "../lib/api";
import type { User } from "../types";

interface AuthFormProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    // Check for university email format
    return email.endsWith("@student.usv.ro") || email.endsWith("@usm.ro");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginData.email) {
      newErrors.loginEmail = "Email-ul este obligatoriu";
    } 
    if (!loginData.password) {
      newErrors.loginPassword = "Parola este obligatorie";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const user = await auth.login(loginData.email, loginData.password);
      // 2. Success
      toast.success("Autentificare reușită!");
      onLogin(user);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Eroare la autentificare";
      setErrors({ ...errors, loginEmail: msg }); // Display error generally or on field
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }

  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!registerData.name.trim()) newErrors.name = "Numele este obligatoriu";
    if (!registerData.email) newErrors.registerEmail = "Email-ul este obligatoriu";
    else if (!validateEmail(registerData.email)) newErrors.registerEmail = "Adresă invalidă"; // Uncomment when ready

    if (!registerData.password) newErrors.registerPassword = "Parola este obligatorie";
    else if (registerData.password.length < 6) newErrors.registerPassword = "Minim 6 caractere";
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Parolele nu se potrivesc";
    }

    setIsLoading(true);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Call Backend
      const user = await auth.register(
        registerData.name, 
        registerData.email, 
        registerData.password
      );
      
      // 2. Success
      toast.success("Cont creat cu succes!");
      onRegister(user);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Eroare la înregistrare";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <h1 className="mb-2 font-bold text-2xl">UniPlans</h1>
          <p className="text-gray-600">
            Sistem de Management al Evenimentelor Universitare
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Autentificare</TabsTrigger>
              <TabsTrigger value="register">Înregistrare</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email universitar</Label>
                  <Input
                    id="login-email"
                    type="email"
                    disabled={isLoading}
                    placeholder="student@usv.ro"
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData({ ...loginData, email: e.target.value });
                      setErrors({ ...errors, loginEmail: "" });
                    }}
                    className={errors.loginEmail ? "border-red-500" : ""}
                  />
                  {errors.loginEmail && <p className="text-sm text-red-500">{errors.loginEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Parolă</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${
                        errors.loginPassword ? "border-red-500" : ""
                      }`}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        });
                        setErrors({ ...errors, loginPassword: "" });
                      }}
                    />
                  </div>
                  {errors.loginPassword && (
                    <p className="text-sm text-red-500">
                      {errors.loginPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-blue-600" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Autentificare"}
                </Button>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-blue-600">
                    Ai uitat parola?
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nume complet</Label>
                  <Input
                    id="register-name"
                    disabled={isLoading}
                    type="text"
                    placeholder="Nume Prenume"
                    value={registerData.name}
                    onChange={(e) => {
                      setRegisterData({
                        ...registerData,
                        name: e.target.value,
                      });
                      setErrors({ ...errors, name: "" });
                    }}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email universitar</Label>
                  <Input
                    id="register-email"
                    disabled={isLoading}
                    type="email"
                    placeholder="nume.prenume@student.usv.ro"
                    value={registerData.email}
                    onChange={(e) => {
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      });
                      setErrors({ ...errors, registerEmail: "" });
                    }}
                    className={errors.registerEmail ? "border-red-500" : ""}
                  />
                  {errors.registerEmail && (
                    <p className="text-sm text-red-500">
                      {errors.registerEmail}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Parolă</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${
                        errors.registerPassword ? "border-red-500" : ""
                      }`}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        });
                        setErrors({ ...errors, registerPassword: "" });
                      }}
                    />
                  </div>
                  {errors.registerPassword && (
                    <p className="text-sm text-red-500">
                      {errors.registerPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmă parola</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        });
                        setErrors({ ...errors, confirmPassword: "" });
                      }}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-blue-600" disabled={isLoading}>
                   {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Creează cont"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Prin crearea contului, ești de acord cu termenii și condițiile
                  platformei
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Universitatea din Suceava. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  );
}
