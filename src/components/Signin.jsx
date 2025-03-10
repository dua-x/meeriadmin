"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

    const router = useRouter();


    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

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
        }
    };



    return (
        <form onSubmit={handleSignIn}>
            <div className="form-container">
                <div className="form-card">
                    <h1>Sign In</h1>

                    {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error message */}
                    {message && <p style={{ color: "green" }}>{message}</p>} {/* Display success message */}

                    <div className="mb-3">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            onChange={handleInputchange}
                            required
                        />

                    </div>

                    <div className="mb-3">
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            onChange={handleInputchange}
                            required
                        />
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Sign In
                        </button>
                    </div>
                    <p className="form-link">
                        Not yet registered? <a href="/signup">Sign up</a>
                    </p>
                </div>
            </div>
        </form>
    );
}
