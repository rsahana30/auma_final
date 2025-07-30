import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/users/signin', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/');
        } catch (error) {
            console.error('Signin error', error);
            alert('Signin failed');
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
        </div>
    );
};

export default Signin;
