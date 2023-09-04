import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://matinhf2002.pythonanywhere.com',
  // baseURL: 'http://127.0.0.1:8000',
})

export default instance
