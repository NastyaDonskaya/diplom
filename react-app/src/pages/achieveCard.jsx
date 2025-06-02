import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
<<<<<<< HEAD
import { API_URL } from "../api";
=======

const API_URL = "http://localhost:3001/api";
>>>>>>> 9081e66 (Update achieveCard.jsx)

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

const AchievementPage = () => {
  const { id } = useParams();
  const [achieve, setAchieve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;

  const handleDelete = async () => {
    const confirm = window.confirm("Вы уверены ?");
    if (!confirm) return;

      try {
        const res = await fetch(`${API_URL}/achieve/${id}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })
        if (!res.ok) {
          const er = await res.json().message
          throw new Error(er || 'Ошибка при удалении');
        }
        alert("Достижение удалено");
      } catch {
        alert("Ошибка при удалении");
      }
  };

  useEffect(() => {
    const fetchAchievement = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/achieve/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Не удалось загрузить достижение");
        }
        setAchieve(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [id, token]);

  if (loading) {
    return <p style={styles.status}>Загрузка...</p>;
  }
  if (error) {
    return <p style={{ ...styles.status, color: "#d93025" }}>{error}</p>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>{achieve.name}</h2>
        <p style={styles.subTitle}>
          Тип: <strong>{achieve.typeName}</strong>
        </p>
        <p style={styles.meta}>
          Дата: {new Date(achieve.date).toLocaleDateString()}
        </p>
        <p style={styles.description}>{achieve.description}</p>

        <div style={styles.author}>
          Автор:{" "}
          <strong>
            {achieve.user.name} {achieve.user.surname}
          </strong>
        </div>

        <h3 style={styles.attributesTitle}>Атрибуты</h3>
        {achieve.attributes.length === 0 ? (
          <p style={styles.noAttributes}>Нет атрибутов</p>
        ) : (
          <ul style={styles.attributeList}>
            {achieve.attributes.map((attr, idx) => (
              <li key={idx} style={styles.attributeItem}>
                <span style={styles.attrName}>{attr.name}:</span>{" "}
                <span style={styles.attrValue}>{attr.value}</span>
              </li>
            ))}
          </ul>
        )}
        {(payload?.role === "hr" || payload?.role === "ceo "|| payload?.id === achieve.userId) && (
        <div style={styles.buttons}>
            <Link to='./edit/'>
              <button style={{ ...styles.button }}>
              Редактировать
              </button>
            </Link>
            <Link to='../achievements'>
              <button style={{ ...styles.button, color: "red"}} onClick={handleDelete}>
              Удалить
              </button>
            </Link>
              
        </div>
        )}
        <Link to="/dashboard/achievements" style={styles.backLink}>
          ← Назад к достижениям
         </Link>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(to right, #e4eff7, #a6c7f7)",
    fontFamily: "Segoe UI, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  container: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
  },
  title: {
    fontSize: "1.8rem",
    color: "#2c3e50",
    marginBottom: "0.5rem",
    fontWeight: "600",
  },
  subTitle: {
    fontSize: "1rem",
    color: "#0056b3",
    marginBottom: "1rem",
  },
  meta: {
    fontSize: "0.9rem",
    color: "#777",
    marginBottom: "1.5rem",
  },
  description: {
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.5",
    marginBottom: "1.5rem",
  },
  author: {
    fontSize: "1rem",
    color: "#0056b3",
    marginBottom: "1.5rem",
  },
  attributesTitle: {
    fontSize: "1.2rem",
    color: "#2c3e50",
    marginBottom: "0.5rem",
  },
  noAttributes: {
    fontSize: "0.95rem",
    color: "#777",
  },
  attributeList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  attributeItem: {
    padding: "0.5rem 0",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
  },
  attrName: {
    fontWeight: "500",
    color: "#333",
  },
  attrValue: {
    color: "#555",
  },
  status: {
    fontSize: "1rem",
    textAlign: "center",
    marginTop: "2rem",
    color: "#333",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
  },
  button: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  },
  backLink: {
    color: "blue",
    textDecoration: "none",
    marginTop: "1rem",
    display: "inline-block",
  },

};

export default AchievementPage;
