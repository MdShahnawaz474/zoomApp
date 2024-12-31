
import { Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/Landing'
import Authentication from './pages/Authentication'
import { AuthProvider } from './contexts/AuthContex'
import VideoMeet from './pages/VideoMeet'

function App() {

  return (
    <>
    <AuthProvider>
   <Routes>
   <Route path='/' element={<LandingPage/>} />
   <Route path='/auth' element={<Authentication/>}/>
   <Route path='/:url'element={<VideoMeet/>} />
   </Routes>
   </AuthProvider>
    </>
  )
}

export default App
