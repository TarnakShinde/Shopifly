"use client";
import { logoutAction } from "../logout/actions.js";
import { login, signup } from "./action.js";
import { ToastContainer, toast } from "react-toastify";

export default function LoginPage() {
    const notify = () =>
            toast.success("Registration Successful", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
    return (
        <div>
            <form>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required />
            <label htmlFor="password">Password:</label>
            <input id="password" name="password" type="password" required />
            <button formAction={login}>Log in</button>
            <button formAction={signup}>Sign up</button>
            <button formAction={logoutAction} onClick={notify}>Logout</button>
        </form>
            <ToastContainer />
        </div>
    );
}
