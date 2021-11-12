import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import GoogleMap from '../components/google-map';
import Header from "../components/header";
import { withSession } from '../middlewares/session';
import { toast, ToastContainer } from 'react-nextjs-toast'

export default function Home({user}) {
  const router = useRouter();

  if(!user) {
    router.push('/login');
    return <div>You need to login first</div>
  }

  useEffect(() => {
    //expose some variables to the browser
    window.BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    window.user = user;
    window.toast = toast;
  }, []);
  return (
    <div style={{
      height:"100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header user={user}></Header>
      <GoogleMap></GoogleMap>
      <ToastContainer />
    </div>
  )
}

export const getServerSideProps = withSession((context) => {
  const { req } = context;
  return {
    props: {
      user: req.session.get('user') || null,
    }
  }
})