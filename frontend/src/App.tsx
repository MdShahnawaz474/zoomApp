
import { Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/Landing'
import Authentication from './pages/Authentication'
import { AuthProvider } from './contexts/AuthContex'

function App() {

  return (
    <>
    <AuthProvider>
   <Routes>
   <Route path='/' element={<LandingPage/>} />
   <Route path='/auth' element={<Authentication/>}/>
   </Routes>
   </AuthProvider>
    </>
  )
}

export default App
