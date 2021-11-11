import styles from '../styles/Home.module.css'
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import GoogleMap from '../components/google-map';
import { withSession } from '../middlewares/session';

export default function Home(props) {
  console.log(props.user);

  useEffect(() => {
    //expose backend url to window object
    window.BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  }, []);
  return (
    <div>
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