
import { BrowserRouter, Route,  Routes } from 'react-router'
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'

import Dashboard from './pages/Dashboard';
import User from './pages/User';

import Adminlayout from "./Layout/Adminlayout"

import AdminCollections from './pages/AdminCollections';
import OfferSlider from './pages/OfferSlider';
import BestDealsAdmin from './pages/BestDealsAdmin';
import Carproduct from './pages/Carproduct';
import Keychainsproduts from './pages/Keychainsproduts';
import AdminFooterEditor from './pages/AdminFooterEditor';
import AdminOrders from './pages/AdminOrders';
import AdminReviews from './pages/AdminReviews';

function App() {
 

  return (
    <>
  <BrowserRouter>
  <Routes>
    {/* //public routes */}
    <Route path='/' element={<Login/>} />
   
    <Route path= "/signup" element = {<Signup/>}/>
    {/* // admin Layout */}
     <Route path="/admin" element={<Adminlayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<User />} />
           <Route path='offerslider' element={<OfferSlider/>}/>
          <Route path="ourcollection" element={<AdminCollections />} />
          <Route path = "bestdeals" element= {<BestDealsAdmin/>}/>
          <Route path='cars' element={<Carproduct/>}/>
          <Route path='keychains' element={<Keychainsproduts/>}/>
           <Route path='order' element={<AdminOrders/>}/>
           <Route path="/admin/reviews" element={<AdminReviews />} />
             <Route path='adminfooter' element={<AdminFooterEditor/>}/>
         
            </Route>
  </Routes>
  </BrowserRouter>
    </>
  
  )
}

export default App
