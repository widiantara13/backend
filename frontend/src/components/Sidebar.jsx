import React from 'react'
import { NavLink } from 'react-router-dom'
import { IoHomeSharp} from "react-icons/io5";
import { IoIosPricetags } from "react-icons/io";
import { FaUser } from "react-icons/fa";
function Sidebar() {
  return (
    <div>
       <aside className="menu pl-2">
            <p className="menu-label">General</p>
            <ul className="menu-list">
                <li>
                    <NavLink to={"/dashboard"}>
                        {<IoHomeSharp/>}   Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/product"}>
                        {<IoIosPricetags/>}   Products
                    </NavLink>
                </li>
            </ul>
            <p className="menu-label">Admin</p>
            <ul className="menu-list">
                <li>
                    <NavLink to={"/userS"}>
                        {<FaUser/>}   Users
                    </NavLink>
                </li>
                
            </ul>
            <p className="menu-label">Setting</p>
            <ul className="menu-list">
                <li>
                    <button classNameName='is-white'>
                        Log out
                    </button>
                </li>
                
            </ul>
        </aside>
    </div>
  )
}

export default Sidebar