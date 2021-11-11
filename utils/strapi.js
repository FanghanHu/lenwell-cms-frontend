import axios from 'axios';

export function createStrapiAxios(user) {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: user && {
      Authorization: `Bearer ${user?.strapiToken}`,
    }
  })
}