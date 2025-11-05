/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { showToastSuccess, showToastError, showToastInfo } from "@/lib/utils/toast";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";

import { AiFillGoogleCircle } from "react-icons/ai";

import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user was redirected after password change or reset
  useEffect(() => {
    const passwordChanged = searchParams.get("passwordChanged");
    const passwordReset = searchParams.get("passwordReset");

    if (passwordChanged === "true") {
      showToastInfo(
        "รหัสผ่านของคุณถูกเปลี่ยนแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
        { autoClose: 5000 }
      );
    }

    if (passwordReset === "true") {
      showToastInfo(
        "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
        { autoClose: 5000 }
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        const form = e.target as HTMLFormElement;
        form.reset();
        setError("");
        showToastSuccess("เข้าสู่ระบบสำเร็จ!");

        // Delay redirect to allow toast notification to be visible
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } else {
        showToastError(result?.error || "Invalid email or password");
        setError(result?.error || "Invalid email or password");
      }
    } catch {
      showToastError("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Log In
          </h2>
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-center mb-4">{success}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                value={email}
                placeholder="Enter your email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                value={password}
                placeholder="Enter your password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="text-right mb-4">
              <Link
                href="/forgot-password"
                className="text-sm text-[#0B264C] hover:underline"
              >
                Forgot Your Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0B264C] text-white py-2 px-4 rounded-md hover:bg-[#0067FF]"
            >
              Log in
            </button>
          </form>
          <div className="relative flex items-center mt-5">
            <hr className="flex-grow border-gray-500" />
            <span className="px-3 text-[#0B264C] text-sm font-medium">or</span>
            <hr className="flex-grow border-gray-500" />
          </div>
          <div className="mt-3 flex justify-center items-center space-x-4">
          <button className="inline-flex transform scale-100 hover:scale-125 transition duration-300"  onClick={() => signIn("facebook")}>
              <FontAwesomeIcon
                icon={faFacebook}
                size="2xl"
                style={{ color: "#0B264C" }}
              />
            </button>

            <button className="inline-flex transform scale-100 hover:scale-125 transition duration-300" onClick={() => signIn("google")}>
              <AiFillGoogleCircle color="#0B264C" size={"38px"} />
            </button>
          </div>

          <p className="mt-4 text-sm text-center text-gray-600">
            Don’t Have An Account?{" "}
            <Link href="/register" className="text-[#0B264C] hover:underline">
              Sign Up Here
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
}
