import React, { useState } from 'react'
import { useRouter } from 'next/router';
import axios from 'axios';

const LoginPage = () => {
    const router = useRouter();
    const [message, setMessage] = useState("");

    const onSubmit = (event) => {
        event.preventDefault();

        const body = {
            email: event.currentTarget.email.value,
            password: event.currentTarget.password.value,
        };

        axios.post('/api/login', body).then((user) => {
            setMessage("");
            window.location = '/';
        }).catch(err => {
            setMessage("Invalid email or password");
            console.error(err);
        });
    }

    return (
        <div className="d-flex flex-column justify-content-center vh-100">
            <div style={{
                maxWidth: "400px",
                margin: "0 auto"
            }}>
                <form method="post" action="/api/login" onSubmit={onSubmit}>
                    <h3 className="text-center">Please login your account</h3>
                    <div className="form-outline mb-4">
                        <input type="email" name="email" className="form-control form-control-lg"
                            placeholder="Email" />
                    </div>

                    <div className="form-outline mb-3">
                        <input type="password" name="password" className="form-control form-control-lg"
                            placeholder="Password" />
                    </div>

                    <p className="text-danger">{message}</p>

                    <button type="submit" className="btn btn-primary btn-lg px-2 float-right">Login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;