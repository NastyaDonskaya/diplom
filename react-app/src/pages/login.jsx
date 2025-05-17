import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from 'react-icons/fi';



function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля.")
      return
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
  
      if (!res.ok) {
        throw new Error("Неверный email или пароль")
      }
  
      const data = await res.json()
      localStorage.setItem("token", data.token)
  
      alert("Вы успешно вошли!")
      setLoading(false)
      setEmail("")
      setPassword("")
      navigate(`/dashboard/main/${data.userId}`)
    } catch (error) {
      setLoading(false)
      setError(error.message)
    }

  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Вход в систему</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Email</label>
          <input
            type="login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Введите email"
          />

          <label style={styles.label}>Пароль</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: "2.5rem" }}
              placeholder="Введите пароль"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggle}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </button>

          <p style={styles.linkText}>
            Нет аккаунта? <Link to="/register" style={styles.link}>Зарегистрируйтесь</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
    wrapper: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(to right,rgb(228, 239, 247), #a6c7f7)", // мягкий градиент
      padding: "1rem",
    },
    container: {
      backgroundColor: "rgba(255, 255, 255, 0.6)", // полупрозрачный белый фон
      padding: "2.5rem",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)", // мягкая тень для контейнера
      width: "100%",
      maxWidth: "420px",
      fontFamily: "Segoe UI, sans-serif",
      transition: "transform 0.3s ease",
      animation: "fadeIn 0.5s ease",
      backdropFilter: "blur(10px)", // размытие фона
    },
    title: {
      textAlign: "center",
      fontSize: "1.6rem",
      fontWeight: "600",
      marginBottom: "2rem",
      color: "#2c3e50",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    label: {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#2c3e50",
    },
    input: {
      padding: "0.85rem",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "1rem",
      backgroundColor: "rgba(255, 255, 255, 0.07)",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease", // добавлен эффект при фокусе
      boxShadow: "0 0px 8px rgba(0, 0, 0, 0.1)", // легкая тень для объема
    },
    passwordWrapper: {
      position: "relative",
    },
    toggle: {
      position: "absolute",
      right: "12px",
      top: "55%",
      height: "100%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "1.2rem",
      color: "#007bff",
      marginTop: "0",
    },
    button: {
      padding: "0.85rem",
      backgroundColor: "#0056b3",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#00408d",
    },
    error: {
      color: "#d93025",
      fontWeight: "600",
      textAlign: "center",
    },
    linkText: {
      textAlign: "center",
      fontSize: "0.9rem",
      color: "#555",
      marginTop: "1rem",
    },
    link: {
      color: "#0056b3",
      textDecoration: "none",
      fontWeight: "600",
    },
  };
  
  

export default Login;