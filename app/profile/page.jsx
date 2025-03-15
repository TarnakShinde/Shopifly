"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }
            fetchProfile(session.user.id);
        };

        checkAuth();
    }, [router]);

    const fetchProfile = async (userId) => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("profiles")
                .select(
                    "userid, userName, userEmail, userAddress, userGender, userAge"
                )
                .eq("userid", userId)
                .single();

            if (error) throw error;

            setProfile(data);
            setFormData({ ...data });
        } catch (error) {
            console.error("Error fetching profile:", error.message);
            setError("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const { error } = await supabase
                .from("profiles")
                .update(formData)
                .eq("userid", profile.userid);

            if (error) throw error;

            setProfile(formData);
            setSuccess("Profile updated successfully!");
            setEditing(false);

            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error("Error updating profile:", error.message);
            setError("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            const response = await fetch("/api/update-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: profile.userEmail }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to send reset email");
            }

            alert("Password reset email sent!");
        } catch (error) {
            alert("Failed to send reset email");
            console.error(error.message);
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white shadow-md rounded-lg p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Your Profile
                    </h1>

                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setEditing(false);
                                setFormData(profile);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {profile && (
                    <form onSubmit={handleSubmit}>
                        {/* User ID - Read Only */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                User ID
                            </label>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                {profile.userid}{" "}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                User ID cannot be changed
                            </p>
                        </div>

                        {/* Editable Fields */}
                        {[
                            "userName",
                            "userEmail",
                            "userAddress",
                            "userAge",
                        ].map((key) => (
                            <div key={key} className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 capitalize">
                                    {key.replace("_", " ")}
                                </label>
                                <input
                                    type={key === "userAge" ? "number" : "text"}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    readOnly={!editing}
                                    className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                        !editing ? "bg-gray-100" : ""
                                    }`}
                                />
                            </div>
                        ))}

                        {/* Gender Dropdown */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Gender
                            </label>
                            <select
                                name="userGender"
                                value={formData.userGender || ""}
                                onChange={handleChange}
                                disabled={!editing}
                                className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                    !editing ? "bg-gray-100" : ""
                                }`}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        {/* Reset Password Button */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition w-full"
                            >
                                Reset Password
                            </button>
                        </div>

                        {editing && (
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition w-full"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
