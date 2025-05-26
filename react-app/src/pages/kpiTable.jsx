import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const roles = {
  ceo: "Руководитель",
  hr: "HR",
  emp: "Сотрудник",
};

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

const KPI_table = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]);
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const typeRes = await fetch(`${API_URL}/kpi_type`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (typeRes.ok) {
          setTypes(await typeRes.json());
        }

        let res;
        const params = new URLSearchParams();

        if (typeFilter) params.append('typeId', typeFilter);

        if (payload.role === 'emp') {
          res = await fetch(`${API_URL}/kpi/lastvals/${payload.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        else {
          res = await fetch(`${API_URL}/kpi/company/kpis?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Не удалось загрузить KPI");
        setKpis(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, typeFilter]);

  const displayed = kpis
    .slice()
    .filter((k) => {
      const term = search.toLowerCase();
      return (
        k.user?.name?.toLowerCase().includes(term) ||
        k.user?.surname?.toLowerCase().includes(term)
      );
    });

  const getRowStyle = (i) => (i % 2 === 0 ? styles.trEven : styles.trOdd);

  if (loading) return <p style={styles.status}>Загрузка...</p>;
  if (error) return <p style={{ ...styles.status, color: "#d93025" }}>{error}</p>;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Показатели KPI</h1>

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

        <input
          type="text"
          placeholder="Поиск по имени сотрудника"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.inputSearch}
        />
      </div>

      {payload.role === 'hr' && (
        <div style={styles.buttonGroup}>
            <Link to="/dashboard/createKpiType" style={styles.button}>
            Создать тип KPI
            </Link>
            <Link to="/dashboard/createKpi" style={styles.button}>
            Добавить KPI
            </Link>
        </div>
        )}


      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Пользователь</th>
              <th style={styles.th}>Роль</th>
              <th style={styles.th}>Тип</th>
              <th style={styles.th}>Значение</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((k, i) => (
              <tr key={k.id} style={getRowStyle(i)}>
                <td style={styles.td}>{k.user?.name} {k.user?.surname}</td>
                <td style={styles.td}>{roles[k.user?.role]}</td>
                <td style={styles.td}>{k.kpi_type?.name || "—"}</td>
                <td style={styles.td}>{k.value}</td>
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                  Нет показателей по заданным фильтрам
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

export default KPI_table;
