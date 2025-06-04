"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
    const [formdata, setformdata] = useState({
        email: "",
        password: ""
    });
    const handleInputchange = (e) => {
        setformdata({
            ...formdata,
            [e.target.name]: e.target.value
        })
    }

    const [error, setError] = useState(''); // State for error messages
    const [message, setMessage] = useState(''); // State for success messages
    const [isForgotPassword, setIsForgotPassword] = useState(false); // State to toggle between login and forgot password
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const router = useRouter();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_IPHOST + '/StoreAPI/users/userauth',
                {
                    query: `
                    mutation userLoginAdmin($email: String!, $password: String!) {
                        userLoginAdmin(input: {email: $email, password: $password}) {
                            username
                            token
                            message
                        }
                    }
                          
                `,
                    variables: {
                        email: formdata.email,
                        password: formdata.password
                    }
                }
            );

            const token = response.data.data.userLoginAdmin.token;
            localStorage.setItem('authtoken', token);
            if(token ){
                setMessage("Logged in successfully");
                setTimeout(()=>{
                    router.push('/');
                },200);
            }else{
                setError(response.data.data.userLoginAdmin.message||"Failed to log in");
            }
            
        } catch (error) {
            if (error.response) {
                setError(error.response.data.data.userLoginAdmin.message || "An error occurred");
            } else {
                setError("Failed to log in. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        if (!formdata.email) {
            setError("Please enter your email address");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_IPHOST + '/StoreAPI/users/userauth',
                {
                    query: `
                    mutation requestPasswordReset($email: String!) {
                        requestPasswordReset(email: $email) {
                            message
                            success
                        }
                    }
                    `,
                    variables: {
                        email: formdata.email
                    }
                }
            );

            const { message, success } = response.data.data.requestPasswordReset;
            if (success) {
                setMessage(message);
            } else {
                setError(message || "Failed to send reset link");
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.errors?.[0]?.message || "An error occurred");
            } else {
                setError("Failed to send reset link. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSignIn}>
            <div className="form-container">
                <div className="form-card">
                    <h1>{isForgotPassword ? "Reset Password" : "Sign In"}</h1>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {message && <p style={{ color: "green" }}>{message}</p>}

                    <div className="mb-3">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            onChange={handleInputchange}
                            value={formdata.email}
                            required
                        />
                    </div>

                    {!isForgotPassword && (
                        <div className="mb-3">
                            <label>Password</label>
                            <input
                                name="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                onChange={handleInputchange}
                                value={formdata.password}
                                required
                            />
                        </div>
                    )}

                    <div className="d-grid">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : 
                             (isForgotPassword ? "Send Reset Link" : "Sign In")}
                        </button>
                    </div>

                    <div className="form-links">
                        {!isForgotPassword ? (
                            <>
                                <p className="form-link">
                                    Not yet registered? <Link href="/signup">Sign up</Link>
                                </p>
                                <p className="form-link">
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        setIsForgotPassword(true);
                                    }}>
                                        Forgot password?
                                    </a>
                                </p>
                            </>
                        ) : (
                            <p className="form-link">
                                Remember your password? <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setIsForgotPassword(false);
                                }}>
                                    Sign in
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}