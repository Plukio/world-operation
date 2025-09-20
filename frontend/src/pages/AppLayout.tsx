import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-3 border-b flex items-center justify-between">
        <h1 className="font-semibold text-lg">World Operation</h1>
        <nav className="flex gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
            }
          >
            Write
          </NavLink>
          <NavLink
            to="/entities"
            className={({ isActive }) =>
              `px-3 py-1 rounded ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}`
            }
          >
            Entities
          </NavLink>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
