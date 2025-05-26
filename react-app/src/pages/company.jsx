import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = 'http://localhost:5000/api';

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

const CompanyPage = () => {
  const [members, setMembers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;

  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === payload.id) return -1;
    if (b.id === payload.id) return 1;
    return 0;
  });

  useEffect(() => {

    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (role) queryParams.append("role", role);
        if (search) queryParams.append("search", search);
        let url;
        if (queryParams.toString()) {
          url = `${API_URL}/user/members?${queryParams.toString()}`
        } else {
          url = `${API_URL}/user/members`
        }
        const membersRes = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const membersData = await membersRes.json();
        if (!membersRes.ok) {
          throw new Error(membersData.message || 'Не удалось загрузить участников');
        }
        
        const queriesRes = await fetch(`${API_URL}/user/members/query`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const queriesData = await queriesRes.json();
        if (!queriesRes.ok) {
          throw new Error(queriesData.message || 'Не удалось загрузить заявки');
        }

        setMembers(membersData);
        setQueries(queriesData);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, payload, role, search]);

  const getRowStyle = (index, id) =>  {
    if (id === payload.id) {
      return styles.trCurrentUser;
    }
    return index % 2 === 0 ? styles.trEven : styles.trOdd;
  }

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${API_URL}/user/members/query/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Ошибка при принятии заявки');
      }

      setQueries((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/user/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Ошибка при удалении участника');
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Компания</h1>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="roleFilter" style={{ marginRight: "0.5rem" }}>
              Фильтр по роли:
            </label>
            <select
              id="roleFilter"
              value={role || ""}
              onChange={(e) => setRole(e.target.value || null)}
              style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="">Все</option>
              <option value="emp">Сотрудник</option>
              <option value="hr">HR-менеджер</option>
              <option value="ceo">Руководитель</option>
            </select>
            <input
              type="text"
              placeholder="Поиск по имени или фамилии"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.5rem",
                marginBottom: "0.5rem",
                marginLeft: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                minWidth: "250px"
              }}
            />
          </div>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Участники</h2>
            {sortedMembers.length === 0 ? (
              <p>Нет участников</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Логин</th>
                      <th style={styles.th}>Роль</th>
                      <th style={styles.th}>Имя</th>
                      <th style={styles.th}>Фамилия</th>
                      {(payload.role === 'hr' || payload.role === 'ceo') && <th style={styles.th}>Действия</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={m.id} style={getRowStyle(i, m.id)}>
                        <td style={styles.td}><Link to={`/dashboard/main/${m.id}`} style={{ color: "black"}}>{m.email}</Link></td>
                        <td style={styles.td}>{m.role}</td>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>{m.surname}</td>
                        { (payload.role === 'hr' || payload.role === 'ceo') &&
                          <td style={styles.td}>
                            <button style={styles.removeButton} onClick={() => handleRemove(m.id)}>
                              Удалить
                            </button>
                          </td>
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {(payload.role === "hr" || payload.role === "ceo") && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Заявки на вступление</h2>
              {queries.length === 0 ? (
                <p>Нет заявок</p>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Логин</th>
                        <th style={styles.th}>Роль</th>
                        <th style={styles.th}>Имя</th>
                        <th style={styles.th}>Фамилия</th>
                        <th style={styles.th}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.map((q, i) => (
                        <tr key={q.id} style={getRowStyle(i)}>
                          <td style={styles.td}>{q.id}</td>
                          <td style={styles.td}><Link to={`/dashboard/main/${q.id}`} style={{ color: "black"}}>{q.email}</Link></td>
                          <td style={styles.td}>{q.role}</td>
                          <td style={styles.td}>{q.name}</td>
                          <td style={styles.td}>{q.surname}</td>
                          <td style={styles.td}>
                            <button style={styles.removeButton} onClick={() => handleAccept(q.id)}>
                              Добавить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "1.5rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#2c3e50",
    maxWidth: "900px",
    margin: "auto",
    backgroundColor: "#f7f9fc",
    minHeight: "100vh",
    borderRadius: "12px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    color: "#004080",
  },
  section: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    marginBottom: "1rem",
    color: "#003366",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },
  th: {
    backgroundColor: "#0077cc",
    color: "white",
    padding: "12px 15px",
    textAlign: "left",
    fontWeight: "600",
    userSelect: "none",
  },
  trEven: {
    backgroundColor: "#f9f9f9",
  },
  trOdd: {
    backgroundColor: "white",
  },
  trCurrentUser: {
    backgroundColor: "rgb(230, 230, 230)",
    fontWeight: "bold",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #ddd",
  },
  // acceptButton: {
  //   backgroundColor: '#3498db',
  //   color: '#fff',
  //   border: 'none',
  //   borderRadius: '6px',
  //   padding: '8px 14px',
  //   cursor: 'pointer',
  //   fontSize: '14px',
  //   transition: 'background-color 0.3s ease',
  // },
  removeButton: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  },

};

export default CompanyPage;
