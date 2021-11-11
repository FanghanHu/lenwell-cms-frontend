import { useEffect, useState } from 'react';
import GoogleMap from '../components/google-map';
import Header from "../components/header";
import { withSession } from '../middlewares/session';

export default function Home({user}) {
  useEffect(() => {
    //expose backend url to window object
    window.BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  }, []);
  return (
    <div style={{
      height:"100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header user={user}></Header>
      <GoogleMap></GoogleMap>
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