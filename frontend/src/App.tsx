
import { Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/Landing'
import Authentication from './pages/Authentication'
import { AuthProvider } from './contexts/AuthContex'
import VideoMeet from './pages/VideoMeet'
import HomeComponent from './pages/Home'
import History from './pages/History'
function App() {

  return (
    <>
    <AuthProvider>
   <Routes>
   <Route path='/' element={<LandingPage/>} />
   <Route path='/auth' element={<Authentication/>}/>
   <Route path="/home" element = {<HomeComponent/>} />
   <Route path='/history' element= {<History/>} />
   <Route path='/:url'element={<VideoMeet/>} />
   </Routes>
   </AuthProvider>
    </>
  )
}

export default App
