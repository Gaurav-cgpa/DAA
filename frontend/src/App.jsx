import { useState } from 'react'



import { Route, Routes } from 'react-router-dom'
import TravelPlanner from './components/TravelPlanner'

function App() {
  

  return (
    <>
   <Routes>
       <Route path='/' element={<TravelPlanner />} />
   </Routes>
    </>
     
  )
}

export default App
