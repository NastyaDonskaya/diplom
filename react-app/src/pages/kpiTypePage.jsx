import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const calcTypes = {
    'DEF': 'Вручную',
    'SUM': 'Сумма',
    'COUNT': 'Количество',
    'MAX': 'Максимум',
    'MIN': 'Минимум',
    'AVG': 'Среднее'
}

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

const KpiTypePage = () => {
  const { id } = useParams();
  const [kpiType, setKpiType] = useState(null);
  const [creater, setCreater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;

  async function fetchUserProfile(userId) {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка загрузки профиля пользователя");
      const data = await res.json();
      setCreater(data);
    } catch {
      setCreater(null);
    }
  }


  const handleDelete = async () => {
    const confirm = window.confirm("Вы уверены? (С типом удалятся все показатели этого типа)");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_URL}/kpi_type/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!res.ok) {
        const er = await res.json().message;
        throw new Error(er || 'Ошибка при удалении');
      }
      alert("Тип КПИ удалён");
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    async function fetchKpiType() {
      try {
        const res = await fetch(`${API_URL}/kpi_type/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Ошибка загрузки данных");
        const data = await res.json();
        setKpiType(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchKpiType();
  }, [id, token]);

  useEffect(() => {
      if (kpiType && kpiType.createdBy) {
        fetchUserProfile(kpiType.createdBy);
      }
    }, [kpiType]);

  if (loading)
    return <div style={{ padding: "1rem", textAlign: "center" }}>Загрузка...</div>;
  if (error)
    return (
      <div style={{ padding: "1rem", color: "red", textAlign: "center" }}>
        Ошибка: {error}
      </div>
    );
  if (!kpiType)
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        Тип КПИ не найден
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>{kpiType.name}</h2>
        <p style={styles.description}>
          {kpiType.description || <span style={{ color: "#888" }}>Нет описания</span>}
        </p>

        <div style={styles.infoBlock}>
          <p>
            <strong>Тип расчёта:</strong> {calcTypes[kpiType.calculationType] || "—"}
          </p>
          <p>
            <strong>Максимальное значение:</strong>{" "}
            {kpiType.maxValue !== null ? kpiType.maxValue : "—"}
          </p>
          <p>
            <strong>Создано:</strong> {creater?.name ?? "—"} {creater?.surname ?? "—"} 
          </p>
          <p>
            <strong>Дата создания:</strong>{" "}
            {kpiType.createdAt
              ? new Date(kpiType.createdAt).toLocaleDateString()
              : "—"}
          </p>
        </div>

        {(payload?.role === "hr") && (
          <div style={styles.buttons}>
            <button
              style={{ ...styles.button, color: "red" }}
              onClick={handleDelete}
            >
              Удалить
            </button>
          </div>
        )}

        <Link to="/dashboard/kpis" style={styles.backLink}>
          ← Назад к KPI
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
    fontSize: "1.2rem",
    color: "#2c3e50",
    marginBottom: "0.5rem",
  },
  description: {
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.5",
    marginBottom: "1.5rem",
  },
  noAttributes: {
    fontSize: "0.95rem",
    color: "#777",
  },
  attributeList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    borderRadius: "8px",
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

export default KpiTypePage;
