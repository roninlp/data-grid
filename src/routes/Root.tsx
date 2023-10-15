import { Link, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
export function Root() {
  return (
    <>
      <div className="flex py-4 px-8 gap-8 text-2xl font-bold">
        <Link to="/">Home</Link>
        <Link to="/glide">Glide</Link>
        {/* <Link to="/rdg">React data grid</Link>
        <Link to="/cdg">Canvas data grid</Link> */}
      </div>
      <hr />
      <Toaster />
      <Outlet />
    </>
  );
}
