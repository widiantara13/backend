import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
function Layout({ children }) {
  return (
    <>
        <Navbar/>
        <div className='columns mt-6'>
            <div className='column is-2'>
                <Sidebar size={15}/>
            </div>
            <div className='column has-background-grey-lighter' style={{minHeight:'100vh'}}>
                <main>
                    {children}
                </main>
            </div>

        </div>
    </>
  )
}

export default Layout