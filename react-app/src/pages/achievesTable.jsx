import React, { useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import { Link } from "react-router-dom";


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

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]);
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const typesRes = await fetch(`${API_URL}/achieve_type`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (typesRes.ok) {
          setTypes(await typesRes.json());
        }

        const res = await fetch(`${API_URL}/achieve/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Не удалось загрузить данные");
        setAchievements(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const displayed = achievements
    .filter((a) =>
      (!typeFilter || a.typeName === types.find(t => t.id === +typeFilter)?.name)
    )
    .filter((a) =>
      (!roleFilter || a.user.role === roleFilter)
    )
    .filter((a) => {
      const term = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(term) ||
        a.user.name.toLowerCase().includes(term) ||
        a.user.surname.toLowerCase().includes(term)
      );
    });

  const getRowStyle = (i) => (i % 2 === 0 ? styles.trEven : styles.trOdd);

  if (loading) return <p style={styles.status}>Загрузка...</p>;
  if (error) return <p style={{ ...styles.status, color: "#d93025" }}>{error}</p>;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Все достижения компании</h1>

      {payload.role === 'hr' && (
        <div style={styles.buttonGroup}>
            <Link to="/dashboard/createAchieveType" style={styles.button}>
            Создать тип достижения
            </Link>
            <Link to="/dashboard/createAchievement" style={styles.button}>
            Добавить достижение
            </Link>
        </div>
        )}


      <div style={styles.controls}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">Все типы</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">Все роли</option>
          <option value="ceo">Руководитель</option>
          <option value="hr">HR</option>
          <option value="emp">Сотрудник</option>
        </select>

        <input
          type="text"
          placeholder="Поиск по названию или имени"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.inputSearch}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Пользователь</th>
              <th style={styles.th}>Роль</th>
              <th style={styles.th}>Тип</th>
              <th style={styles.th}>Название</th>
              <th style={styles.th}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((a, i) => (
              <tr key={a.id} style={getRowStyle(i)}>
                <td style={styles.td}>{a.id}</td>
                <td style={styles.td}>
                  {a.user.name} {a.user.surname}
                </td>
                <td style={styles.td}>{a.user.role}</td>
                <td style={styles.td}>{a.typeName}</td>
                <td style={styles.td}>{a.name}</td>
                <td style={styles.td}>
                  {format(parseISO(a.date), "dd.MM.yyyy")}
                </td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                  Нет достижений по заданным фильтрам
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "1.5rem 5rem",
    fontFamily: "Segoe UI, sans-serif",
    color: "#2c3e50",
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "#f7f9fc",
    borderRadius: "12px",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
    },

  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#0077cc",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    textDecoration: "none",
  },

  title: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "1rem",
    color: "#004080",
  },
  controls: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  select: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  inputSearch: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flexGrow: 1,
    minWidth: "200px",
  },
  tableContainer: {
    overflowX: "auto",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  th: {
    backgroundColor: "#0077cc",
    color: "#fff",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
  },
  trEven: {
    backgroundColor: "#f9f9f9",
  },
  trOdd: {
    backgroundColor: "#fff",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
  },
  status: {
    textAlign: "center",
    marginTop: "2rem",
    fontSize: "1rem",
  },
};

export default AchievementsPage;
