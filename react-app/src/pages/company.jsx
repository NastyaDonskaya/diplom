import React, { useEffect, useState } from "react";

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
  const token = localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;


  useEffect(() => {
    const storedRole = payload.role;
    setRole(storedRole);

    const fetchData = async () => {
      try {
        const membersRes = await fetch(`${API_URL}/user/members`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!membersRes.ok) {
          const err = await membersRes.json();
          throw new Error(err.message || 'Не удалось загрузить участников');
        }
        const membersData = await membersRes.json();

        const queriesRes = await fetch(`${API_URL}/user/members/query`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!queriesRes.ok) {
          const err = await queriesRes.json();
          throw new Error(err.message || 'Не удалось загрузить заявки');
        }
        const queriesData = await queriesRes.json();

        setMembers(membersData);
        setQueries(queriesData);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getRowStyle = (index) => (index % 2 === 0 ? styles.trEven : styles.trOdd);

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${API_URL}/user/members/query/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Ошибка при принятии заявки');
      }

      setQueries((prev) => prev.filter((q) => q.id !== id));
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
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Участники</h2>
            {members.length === 0 ? (
              <p>Нет участников</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Роль</th>
                      <th style={styles.th}>Имя</th>
                      <th style={styles.th}>Фамилия</th>
                      <th style={styles.th}>Отдел</th>
                      <th style={styles.th}>Телефон</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={m.id} style={getRowStyle(i)}>
                        <td style={styles.td}>{m.id}</td>
                        <td style={styles.td}>{m.email}</td>
                        <td style={styles.td}>{m.role}</td>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>{m.surname}</td>
                        <td style={styles.td}>{m.department || '-'}</td>
                        <td style={styles.td}>{m.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {(role === "hr" || role === "ceo") && (
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
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Роль</th>
                        <th style={styles.th}>Имя</th>
                        <th style={styles.th}>Фамилия</th>
                        <th style={styles.th}>Отдел</th>
                        <th style={styles.th}>Телефон</th>
                        <th style={styles.th}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.map((q, i) => (
                        <tr key={q.id} style={getRowStyle(i)}>
                          <td style={styles.td}>{q.id}</td>
                          <td style={styles.td}>{q.email}</td>
                          <td style={styles.td}>{q.role}</td>
                          <td style={styles.td}>{q.name}</td>
                          <td style={styles.td}>{q.surname}</td>
                          <td style={styles.td}>{q.department || '-'}</td>
                          <td style={styles.td}>{q.phone || '-'}</td>
                          <td style={styles.td}>
                            <button onClick={() => handleAccept(q.id)}>Добавить</button>
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
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #ddd",
  },
};

export default CompanyPage;
