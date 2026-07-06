import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-900 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-white"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Package className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Mini ERP</h1>
          <p className="mt-4 text-lg text-indigo-200">
            Inventory &amp; Sales Management System
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <h3 className="font-semibold">Inventory Control</h3>
              <p className="mt-1 text-sm text-indigo-200">
                Track stock levels and manage products efficiently
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <h3 className="font-semibold">Sales Tracking</h3>
              <p className="mt-1 text-sm text-indigo-200">
                Record sales and monitor revenue in real time
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <h3 className="font-semibold">Low Stock Alerts</h3>
              <p className="mt-1 text-sm text-indigo-200">
                Get notified when inventory runs low
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <h3 className="font-semibold">Role-Based Access</h3>
              <p className="mt-1 text-sm text-indigo-200">
                Secure system with admin and staff roles
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center bg-muted/30 p-6 lg:w-1/2">
        <LoginForm />
      </div>
    </div>
  );
}
