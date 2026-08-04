import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    PieChart,
    ShoppingBasket,
    TrendingUp,
    MessageSquare,
    Database,
    Zap
} from "lucide-react";

export default function Sidebar() {

    const menu = [
        {
            section: "Analytics",
            items: [
                { label: "Overview",           path: "/",              icon: <LayoutDashboard size={16} /> },
                { label: "Revenue Outlook",    path: "/forecast",      icon: <TrendingUp size={16} /> },
                { label: "Customer Segments",  path: "/segments",      icon: <PieChart size={16} /> },
            ]
        },
        {
            section: "Intelligence",
            items: [
                { label: "Customer Value",     path: "/clv",           icon: <Users size={16} /> },
                { label: "Basket Analysis",    path: "/recommendations",icon: <ShoppingBasket size={16} /> },
                { label: "Ask AI",             path: "/ask",           icon: <MessageSquare size={16} /> },
            ]
        },
        {
            section: "System",
            items: [
                { label: "Data Center",        path: "/data-center",   icon: <Database size={16} /> },
            ]
        }
    ];

    return (
        <aside className="sidebar">

            {/* Brand */}
            <div className="brand">
                <div className="brand-icon">
                    <Zap size={18} />
                </div>
                <div className="brand-text">
                    <h1>RetailIQ</h1>
                    <span>Decision Intelligence</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menu.map((section) => (
                    <div key={section.section}>
                        <p className="nav-section-label">{section.section}</p>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    isActive ? "nav-item active" : "nav-item"
                                }
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                <span className="nav-dot" />
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="status-pill">
                    <span className="status-dot" />
                    <span>API Connected</span>
                </div>
            </div>

        </aside>
    );
}