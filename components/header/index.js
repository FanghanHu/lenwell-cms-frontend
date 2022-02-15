import { useRouter } from "next/dist/client/router";
import style from "./style.module.css";
import axios from 'axios';
import {useUser} from "../../context/user-context";
import { useEffect } from "react";

export default function Header() {
    const router = useRouter();
    const user = useUser();

    useEffect(() => {
        if(!user) {
          router.push('/login');
          return <div>You need to login first</div>
        }
    }, []);

    const logout = () =>  {
        axios.post('/api/logout').then(() => {
            router.push('/login')
          })
    }

    return (
        <div className={style.container}>
            <img src="assets/icon/lenwell-logo.svg" className={style.logo}></img>
            <div className="d-flex align-items-baseline">
                <button className="btn btn-sm m-2 btn-primary" onClick={() => {
                    //show the marker list of current user
                    showList();
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" height="1.5rem">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </button>
                <h4>Welcome, {user?user.name:"stranger"}</h4>
                <button className="btn btn-sm m-2 btn-light" onClick={logout}>logout</button>
            </div>
        </div>
    )
}