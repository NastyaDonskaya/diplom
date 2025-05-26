import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState(""); 
  const [companyName, setCompanyName] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !role) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    if ((role === "hr" || role === "emp") && !companyName) {
      setError("Пожалуйста, укажите название компании.");
      return;
    }

    if ((role === "hr" || role === "emp") && !companyPassword) {
        setError("Пожалуйста, введите пароль компании.");
        return;
      }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/user/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          name,
          surname,
          age,
          companyName,
          companyPassword,
        }),
      });

      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }
  
      setLoading(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setCompanyName("");

      localStorage.setItem("token", data.token)
      
      navigate(`/dashboard/main/${data.userId}`);

    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
    
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Регистрация</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Логин</label>
          <input
            type="login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Введите email"
            required
          />

          <label style={styles.label}>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Введите пароль"
            required
          />

          <label style={styles.label}>Подтверждение пароля</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            placeholder="Повторите пароль"
            required
          />

          <label style={styles.label}>Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="Введите имя"
          />

          <label style={styles.label}>Фамилия</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            style={styles.input}
            placeholder="Введите фамилию"
          />

          <label style={styles.label}>Возраст</label>
          <input
            type="number"
            value={age}
            min="0"
            onChange={(e) => setAge(e.target.value)}
            style={styles.input}
            placeholder="Введите возраст"
          />


          <label style={styles.label}>Роль</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{...styles.input}}
            required
          >
            <option value="">Выберите роль</option>
            <option value="emp">Сотрудник</option>
            <option value="ceo">Руководитель</option>
            <option value="hr">HR-менеджер</option>
          </select>

          
          <label style={styles.label}>Название компании</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={styles.input}
            placeholder={role !== "ceo" ? "Введите название компании" : "Придумайте название компании"}
          />
        <label style={styles.label}>Пароль компании</label>
        <input
            type="password"
            value={companyPassword}
            onChange={(e) => setCompanyPassword(e.target.value)}
            style={styles.input}
            placeholder={role !== "ceo" ? "Введите пароль вашей компании" : "Придумайте пароль вашей компании"}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Загрузка..." : (role != "ceo" ? "Зарегистрироваться" : "Создать компанию")}
          </button>

          <p style={styles.linkText}>
            Уже есть аккаунт? <Link to="/login" style={styles.link}>Войдите</Link>
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
    background: "linear-gradient(to right, rgb(228, 239, 247), #a6c7f7)",
    padding: "1rem",
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "420px",
    fontFamily: "Segoe UI, sans-serif",
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
    transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
    boxShadow: "0 0px 8px rgba(0, 0, 0, 0.1)",
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

export default Register;