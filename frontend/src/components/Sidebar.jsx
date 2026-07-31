import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    BarChart3,
    ShoppingBasket,
    TrendingUp,
    MessageSquare,
    Database
} from "lucide-react";

export default function Sidebar() {

    const menu = [
        {
            label: "Overview",
            path: "/",
            icon: <LayoutDashboard size={18} />
        },
        {
            label: "Customer Value",
            path: "/clv",
            icon: <Users size={18} />
        },
        {
            label: "Customer Segments",
            path: "/segments",
            icon: <BarChart3 size={18} />
        },
        {
            label: "Basket Analysis",
            path: "/recommendations",
            icon: <ShoppingBasket size={18} />
        },
        {
            label: "Revenue Outlook",
            path: "/forecast",
            icon: <TrendingUp size={18} />
        },
        {
            label: "Ask AI",
            path: "/ask",
            icon: <MessageSquare size={18} />
        },
        {
            label: "Data Center",
            path: "/data-center",
            icon: <Database size={18} />
        }
    ];

    return (
        <aside className="sidebar">

            <div className="brand">



                <div>
                    <h1 className="type-4">Dashboard</h1>
                    <span className="type-1" style={{textTransform: 'uppercase'}}>
                        Retail Decision Intelligence
                    </span>
                </div>

            </div>

            <nav className="sidebar-nav">

                {menu.map((item) => (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? "nav-item active"
                                : "nav-item"
                        }
                    >

                        {item.icon}

                        <span>
                            {item.label}
                        </span>

                    </NavLink>

                ))}

            </nav>



        </aside>
    );
}