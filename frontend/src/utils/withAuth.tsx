import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent:any) => {
    const AuthComponent = (props:any) => {
        const router = useNavigate();

        const isAuthenticated = () => {
            return !!localStorage.getItem("token");
        };

        useEffect(() => {
            if (!isAuthenticated()) {
                router("/auth");
            }
        }, []);

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
