import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Password does not match');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/users/signup', { name, email, password, role });
            localStorage.setItem('token', response.data.token);
            navigate('/');
            alert(response.data.message);
        } catch (error) {
            console.error('Signup error', error.message);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Signup failed");
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
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
        </div>

    );
};

export default Signup;
