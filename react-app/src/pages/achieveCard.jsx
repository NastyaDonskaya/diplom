import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

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
};

export default AchievementPage;
