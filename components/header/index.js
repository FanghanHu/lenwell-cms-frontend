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
                <h4>Welcome, {user?user.name:"stranger"}</h4>
                <button className="btn btn-sm m-2 btn-light" onClick={logout}>logout</button>
            </div>
        </div>
    )
}