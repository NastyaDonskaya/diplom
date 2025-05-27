import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = 'http://localhost:5000/api'

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const EmployeeDashboard = () => {
  const { id } = useParams()
  const [kpiValues, setKpiValues] = useState([]);
  const [achieves, setAchieves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [owner, setOwner] = useState(null);
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;

  const handleDownloadReport = async () => {
    try {
      const res = await fetch(`${API_URL}/report/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Ошибка при получении отчёта");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerRes = await fetch(`${API_URL}/user/profile/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const ownerData = await ownerRes.json();
        if (!ownerRes.ok) {
          throw new Error(ownerData.message || 'Ошибка при получении пользвателя');
        }
        setOwner(ownerData)

        const kpiRes = await fetch(`${API_URL}/kpi/lastvals/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (kpiRes.ok) {
          const data = await kpiRes.json();
          setKpiValues(data);
          setLoading(false);
        } else {
          const e = await kpiRes.json();
          setError(true);
          alert(`Ошибка: ${e.message || 'Не удалось загрузить KPI'}`);
        }
        const achieveRes = await fetch(`${API_URL}/achieve/all/${id}`,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (achieveRes.ok) {
          const achieveData = await achieveRes.json();
          const sorted = achieveData.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAchieves(sorted.slice(0, 5)); // только последние 5
        } else {
          const e = await achieveRes.json();
          console.error("Ошибка получения достижений:", e.message);
        }
      } catch (e) {
          alert(`Сервер не отвечает: ${e.message}`);
          setLoading(false)
      }
    };

    fetchData();
  }, []);




  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Страница пользователя</h1>
        <h2>{owner ? `${owner.name || owner.login} ${owner.surname || ""}` : "Загрузка..."}</h2>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Показатели</h2>

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {kpiValues.length === 0 && <p>Нет показателей</p>}
        <div style={styles.cardRow}>
          {kpiValues.map((kpi) => (
            <div key={kpi.id} style={styles.card}>
              <p style={styles.cardTitle}>{kpi.kpi_type.name}</p>
              <p style={styles.cardValue}>{kpi.value}</p>
              <Link
                to={`/dashboard/kpiCard/${id}/${kpi.kpi_type.id}`}
                style={styles.linkButton}
              >
                Перейти →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Последние достижения</h2>
        {achieves.length === 0 ? (
          <p>Нет достижений</p>
        ) : (
          <ul style={styles.achieveList}>
            {achieves.map((a) => (
              <li key={a.id} style={styles.achieveItem}>
                <Link to={`/dashboard/achievement/${a.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                  <strong>{a.name}</strong>
                </Link> — {a.achieve_type?.name || "Неизвестно"}, {a.date}
              </li>
            ))}
            {achieves.length > 5 && <li>И еще {achieves.length - 5} достижений...</li>}
          </ul>
        )}
        <Link to='/dashboard/achievements'><button style={styles.button}>Все достижения</button></Link>
      </section>

      {/* отчеты*/}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Отчеты</h2>

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={styles.cardRow}>
          {(payload.role === 'hr' || payload.role === 'ceo') && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button style={styles.button} onClick={handleDownloadReport}>
                Скачать отчет о пользователе
              </button>
            </div>
          )}
        </div>
      </section>
      
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
    color: "#2c3e50",
    background: "linear-gradient(to right, #e4eff7, #a6c7f7)",
  },
  section: {
    marginBottom: "2.5rem",
    padding: "1.5rem",
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
    fontWeight: "600",
    color: "#333",
  },
  cardRow: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  card: {
    background: "rgba(255, 255, 255, 0.55)",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    minWidth: "180px",
    flex: "1",
    backdropFilter: "blur(10px)",
  },
  cardTitle: {
    fontSize: "0.95rem",
    color: "#777",
    marginBottom: "0.5rem",
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#0056b3",
  },
  cardDescription: {
    fontSize: "0.85rem",
    color: "#555",
    marginTop: "1rem",
  },
  linkButton: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.4rem 0.8rem',
    backgroundColor: "#0056b3",
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '0.9rem',
    transition: 'background 0.2s',
  },

  achieveList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    lineHeight: "1.8",
  },
  achieveItem: {
    fontSize: "0.95rem",
    borderBottom: "1px solid #ccc",
    paddingBottom: "0.5rem",
    marginBottom: "0.5rem",
  },
  button: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default EmployeeDashboard;
