import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.email && location.state.password) {
            setEmail(location.state.email);
            setPassword(location.state.password);
            toast.info('Please sign in with your new credentials.');
        }
    }, [location.state]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email is required.';
        } else if (!emailRegex.test(email)) {
            return 'Invalid email format.';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required.';
        } else if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailValidationMsg = validateEmail(email);
        const passwordValidationMsg = validatePassword(password);

        if (emailValidationMsg) {
            toast.error(emailValidationMsg);
        }
        if (passwordValidationMsg) {
            toast.error(passwordValidationMsg);
        }

        if (emailValidationMsg || passwordValidationMsg) {
            return; // Stop if there are validation errors
        }

        try {
            const response = await axios.post('http://localhost:5000/api/users/signin', { email, password });
            localStorage.setItem('token', response.data.token);
            toast.success('Signin successful!');
            navigate('/');
        } catch (error) {
            console.error('Signin error', error);
            toast.error('Signin failed. Please check your credentials.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
                <form onSubmit={handleSubmit}>
                    <div className="text-center mb-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{ maxHeight: "60px", objectFit: "contain" }}
                        />
                    </div>
                    <hr className="mb-4" />
                    <h3 className="text-center mb-4">Login</h3>

                    <div className="mb-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            placeholder="Email"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            placeholder="Password"
                            className="form-control"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        Login
                    </button>
                    <p className="text-center mb-0">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-decoration-none">
                            Sign Up
                        </a>
                    </p>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signin;
