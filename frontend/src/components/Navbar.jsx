import React from 'react'

function Navbar() {
  return (
    <div>
       <nav className="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
         <div className="navbar-brand">
           <a className="navbar-item" href="https://bulma.io">
             <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28"/>
           </a>
       
           <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
             <span aria-hidden="true"></span>
             <span aria-hidden="true"></span>
             <span aria-hidden="true"></span>
           </a>
         </div>
       
         
         
       </nav>
    </div>
  )
}

export default Navbar