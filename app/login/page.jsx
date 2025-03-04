"use client";
import { logoutAction } from "../logout/actions";
import { login } from "./action.js";
import { ToastContainer, toast } from "react-toastify";
import React, { useState } from "react";

export default function LoginPage() {
    const notify = () =>
        toast.success("Sign in Successfully", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        // <div>
        //     <form>
        //         <label htmlFor="email">Email:</label>
        //         <input id="email" name="email" type="email" required />
        //         <label htmlFor="password">Password:</label>
        //         <input id="password" name="password" type="password" required />
        //         <button formAction={login}>Log in</button>
        //         <button formAction={logoutAction} onClick={notify}>
        //             Logout
        //         </button>
        //     </form>
        //     <ToastContainer />
        // </div>
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="mx-auto h-10 w-auto text-4xl text-center font-bold">
                        {" "}
                        SHOPI<span className="text-green-500">FLY</span>
                    </div>
                    <h2 className="mt-10 text-center text-2xl/9 tracking-tight text-gray-900">
                        Login to Shopifly
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6">
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
                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                formAction={login}
                                onClick={notify}
                            >
                                Login
                            </button>
                            <ToastContainer />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
