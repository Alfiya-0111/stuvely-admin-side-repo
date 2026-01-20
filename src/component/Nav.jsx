import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebaseConfig'   // make sure this points to your firebase config file
import { signOut } from 'firebase/auth'

function Nav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      navigate("/"); // redirect to login page after logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <section>
      <header>
        <nav className='flex justify-between items-center nav_mains p-5 bg-indigo-400 shadow-md relative'>
          <div className="text-4xl text-white text-center logo_text mb-4">Stuvely</div>
          <ul className='flex gap-10 items-center'>
          
            <li>
              <button 
                onClick={handleLogout} 
                className='text-white text-2xl px-3 py-1 rounded-md '
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </section>
  )
}

export default Nav
