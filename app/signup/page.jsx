"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { error, success } from "../../utils/toastify";
import bcrypt from "bcryptjs";
import { createClient } from "../../utils/supabase/client";

const strengthLabels = ["weak", "medium", "medium", "strong"];

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState();
    const [gender, setGender] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const notifySuccess = () => success("Registration Successful");
    const notifyError = () => error("Password Do Not Match");

    const getStrength = (password) => {
        let strengthIndicator = -1;
        if (/[a-z]/.test(password)) strengthIndicator++;
        if (/[A-Z]/.test(password)) strengthIndicator++;
        if (/\d/.test(password)) strengthIndicator++;
        if (/[^a-zA-Z0-9]/.test(password)) strengthIndicator++;
        if (password.length >= 16) strengthIndicator++;
        return strengthLabels[strengthIndicator];
    };

    // To check the strength of the password
    const handleChange = (event) => {
        setStrength(getStrength(event.target.value));
    };
    //To toggle the password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    //To check the password and confirm password are same
    const validatePassword = () => {
        return password === confirmPassword;
    };
    // To handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");
        if (!validatePassword()) {
            setPasswordError("Passwords do not match");
            return;
        }
        try {
            setLoading(true);
            // Hash the password for our custom storage
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: userName,
                        },
                    },
                });

            if (authError) throw authError;
            console.log("Auth signup successful, user data:", authData.user);

            // 2. Sign in immediately after signup to get a valid session
            const { data: signInData, error: signInError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (signInError) throw signInError;
            console.log("Sign-in successful, session established");

            // Make sure we have a valid user ID before proceeding
            const userId = authData.user.id;
            if (!userId) {
                throw new Error("User ID is missing after authentication");
            }

            // 3. Now that we're authenticated, insert into profiles table with explicit logging
            console.log("Attempting to create profile for user ID:", userId);
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .insert([
                    {
                        userid: userId,
                        userName: userName,
                        userEmail: email,
                        userPassword: hashedPassword,
                        created_at: new Date().toISOString(), // Ensure proper date format
                    },
                ])
                .select(); // Add this to see the returned data

            if (profileError) {
                console.error("Profile creation error:", profileError);
                throw new Error(
                    "Failed to create profile. " + profileError.message
                );
            }

            console.log("Profile created successfully:", profileData);

            toast.success(
                "Sign up successful! Please check your email for verification."
            );
            setEmail("");
            setUserName("");
            setPassword("");
            setConfirmPassword("");
            setStrength("");

            // Add redirect to home page AFTER successful operations
            router.push("/");
        } catch (error) {
            console.error("Error during sign up:", error);
            toast.error(error.message || "Sign up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="mx-auto h-10 w-auto text-4xl text-center font-bold">
                        {" "}
                        SHOPI<span className="text-green-500">FLY</span>
                    </div>
                    <h2 className="mt-10 text-center text-2xl/9 tracking-tight text-gray-900">
                        Register to Shopifly
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="userName"
                                className="block text-sm/6 font-medium text-gray-900"
                            >
                                User Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="uname"
                                    name="uname"
                                    type="text"
                                    required
                                    autoComplete="uname"
                                    value={userName}
                                    onChange={(e) =>
                                        setUserName(e.target.value)
                                    }
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm/6 font-medium text-gray-900"
                            >
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            handleChange(e);
                                        }}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-2 top-2"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm/6 font-medium text-gray-900"
                                    >
                                        Confirm Password
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <div className="relative">
                                        <input
                                            id="confirmpassword"
                                            name="confirmPassword"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            required
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-2 top-2"
                                        >
                                            {showPassword ? (
                                                <EyeOff />
                                            ) : (
                                                <Eye />
                                            )}
                                        </button>
                                        <div className="mt-2">
                                            {passwordError && (
                                                <p className="error">
                                                    {passwordError}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            className={`flex items-center h-1 rounded bg-gray-900 my-2`}
                                        >
                                            <div
                                                className={`h-1.5 rounded transition-all duration-400 ${
                                                    strength === "weak"
                                                        ? "bg-red-500 w-1/3"
                                                        : strength === "medium"
                                                        ? "bg-orange-500 w-2/3"
                                                        : strength === "strong"
                                                        ? "bg-green-500 w-full"
                                                        : "w-0"
                                                }`}
                                            ></div>
                                        </div>
                                        <div className="text-left h-8 capitalize text-gray-500">
                                            {strength && `${strength} password`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign Up
                            </button>
                            <ToastContainer />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SignUp;
