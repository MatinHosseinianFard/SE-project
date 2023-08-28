import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://matinhf2002.pythonanywhere.com',
})

export default instance
