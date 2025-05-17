import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Ошибка парсинга токена:", e);
    return null;
  }
}

const API_URL = 'http://localhost:5000/api'

const DashboardLayout = () => {

  const [isPhone, setIsPhone] = useState(window.innerWidth < 768);
  const [navIsOpen, setNavIsOpen] = useState(false);
  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null  

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (

    <div style={styles.wrapper}>
      {isPhone && navIsOpen && (
        <div style={styles.mobileSidebar}>
          <button onClick={() => setNavIsOpen(false)} style={styles.closeBtn}>×</button>
          <nav style={styles.nav}>
            <Link style={styles.link} to={`/dashboard/main/${payload.id}`}>Главная</Link>
            <Link style={styles.link} to="/achievements">Достижения</Link>
            <Link style={styles.link} to="/reports">Отчеты</Link>
            <Link style={styles.link} to="/settings">Компания</Link>
          </nav>
        </div>
      )}
      {!isPhone && (
        <aside style={styles.sidebar}>
          <h2 style={styles.logo}>{payload.companyName}</h2>
          <nav style={styles.nav}>
            <Link style={styles.link} to={`/dashboard/main/${payload.id}`}>Главная</Link>
            <Link style={styles.link} to="/achievements">Достижения</Link>
            <Link style={styles.link} to="/achievements">Показатели KPI</Link>
            <Link style={styles.link} to="/reports">Отчеты</Link>
            <Link style={styles.link} to="/settings">Компания</Link>
          </nav>
        </aside>
      )}

      <main style={styles.main}>
        <header style={styles.header}>
          {isPhone && (
            <button onClick={() => setNavIsOpen(true)} style={styles.burger}>
              ☰
            </button>
          )}
          <div style={styles.headerInner}>
            <Link to={`profile/${payload.id}`} style={styles.usernameLink}>
              {payload.name} {payload.surname} ({payload.role})
            </Link>
            <div style={styles.date}>{new Date().toLocaleDateString("ru-RU")}</div>
          </div>
        </header>
        <div style={styles.content}>
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    background: "linear-gradient(to right, #e4eff7, #a6c7f7)",
  },
  burger: {
    fontSize: "1.5rem",
    background: "none",
    border: "none",
    color: "#2c3e50",
    cursor: "pointer",
    marginRight: "1rem",
  },
  
  mobileSidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "220px",
    height: "100vh",
    backgroundColor: "#0a2540",
    padding: "1.5rem",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
  },
  
  closeBtn: {
    alignSelf: "flex-end",
    fontSize: "1.5rem",
    background: "none",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
  },

  sidebar: {
    width: "240px",
    backgroundColor: "#0a2540", // тёмная панель
    color: "#ffffff",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: "2rem",
    textAlign: "center",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  link: {
    color: "#ffffffd9",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  main: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "1rem 2rem",
    borderBottom: "1px solid #cdddec",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    justifyContent: "flex-end",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  headerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1200px",
    color: "#2c3e50",
    fontWeight: "500",
  },
  usernameLink: {
    color: "#2c3e50",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    cursor: "pointer",
  },
  content: {
    padding: "2rem",
    flex: 1,
  },
};

export default DashboardLayout;
