import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const navigate = useNavigate();

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
        } else if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        } else if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        } else if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number.';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'Password must contain at least one special character.';
        }
        return '';
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) {
            return 'Confirm Password is required.';
        } else if (password !== confirmPassword) {
            return 'Passwords do not match.';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailValidationMsg = validateEmail(email);
        const passwordValidationMsg = validatePassword(password);
        const confirmPasswordValidationMsg = validateConfirmPassword(password, confirmPassword);

        if (emailValidationMsg) {
            toast.error(emailValidationMsg);
        }
        if (passwordValidationMsg) {
            toast.error(passwordValidationMsg);
        }
        if (confirmPasswordValidationMsg) {
            toast.error(confirmPasswordValidationMsg);
        }

        if (emailValidationMsg || passwordValidationMsg || confirmPasswordValidationMsg) {
            return; // Stop if there are validation errors
        }

        try {
            const response = await axios.post('http://localhost:5000/api/users/signup', { name, email, password, role });
            localStorage.setItem('token', response.data.token);
            toast.success(response.data.message);
            navigate('/signin', { state: { email, password } });
        } catch (error) {
            console.error('Signup error', error.message);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Signup failed");
            }
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
                    <h3 className="text-center mb-4">Sign Up</h3>
                    <div className="mb-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(''); // Clear error on change
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
                                setPasswordError(''); // Clear error on change
                            }}
                            placeholder="Password"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setConfirmPasswordError(''); // Clear error on change
                            }}
                            placeholder="Confirm Password"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-control"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="customer">Customer</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        Sign Up
                    </button>

                    <p className="text-center mb-0">
                        Already have an account?{" "}
                        <a href="/signin" className="text-decoration-none">
                            Login
                        </a>
                    </p>
                </form>
            </div>
            <ToastContainer />
        </div>

    );
};

export default Signup;
