import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://project-lip.onrender.com',
  headers: {
    accept: 'application/json'
  }
})
