/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent } from "react";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";
import { Bounce, ToastContainer } from "react-toastify";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fname, setfName] = useState("");
  const [lname, setlName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fname || !lname || !email || !password || !confirmPassword) {
      showToastError("All fields are required.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      showToastError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      showToastError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      showToastError("Password must be at least 8 characters long.");
      return;
    }

    const passwordStrengthRegex =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()-_+=\[\]{}|\\;:'",.<>/?]{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      showToastError(
        "Password must contain at least one letter and one number."
      );
      return;
    }

    try {
      const response = await fetch(`/api/v1/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fname, lname, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        const form = e.target as HTMLFormElement;
        showToastSuccess("Registration successful! Logging you in...");
        form.reset();

        // Auto login after successful registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          showToastError("Registration successful but login failed. Please login manually.");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        }
      } else {
        // Show field-specific errors if available
        if (data?.errors && typeof data.errors === 'object') {
          // Show all field errors
          Object.entries(data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => showToastError(`${field}: ${msg}`));
            }
          });
        } else {
          // Show general error message
          showToastError(
            data?.message?.error ?? data?.error ?? "Something went wrong."
          );
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      showToastError("Something went wrong. Please try again later.");
      return;
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Register
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First name
              </label>
              <input
                onChange={(e) => setfName(e.target.value)}
                type="text"
                id="first_name"
                placeholder="Enter your first name"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last name
              </label>
              <input
                onChange={(e) => setlName(e.target.value)}
                type="text"
                id="last_name"
                placeholder="Enter your last name"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                id="email"
                placeholder="Enter your email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                id="password"
                placeholder="Enter your password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                id="confirm_password"
                placeholder="Confirm your password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B264C] text-white py-2 px-4 rounded-full hover:bg-[#0067FF]"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600">
            I already have an account{" "}
            <Link href="/login" className="text-[#0B264C] hover:underline">
              Sign in Here!
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
