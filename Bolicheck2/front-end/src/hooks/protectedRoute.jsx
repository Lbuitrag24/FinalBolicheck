import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const isStaff = localStorage.getItem("is_staff") === "true";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";

    if (!token) {
        return <Navigate to="/login" />;
    }

    const userRole = isSuperuser ? "superuser" : isStaff ? "staff" : "client";

    // eslint-disable-next-line react/prop-types
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute