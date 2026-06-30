import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page which now handles both login and signup
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
}

export default Register;