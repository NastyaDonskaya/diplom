  import React, { useEffect, useState } from "react";
  import { parseISO, format } from "date-fns";
  import { Link } from "react-router-dom";


  const API_URL = "http://localhost:5000/api";

  const roles = {
    "ceo": "Руководитель",
    "hr": "HR",
    "emp": "Сотрудник",
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

  const AchievementsPage = () => {
    const [tab, setTab] = useState("achievements");
    const [achievements, setAchievements] = useState([]);
    const [achievementTypes, setAchievementTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [search, setSearch] = useState("");
    const [types, setTypes] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [attrs, setAttrs] = useState([]);
    const [attrValues, setAttrValues] = useState({});

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

          const params = new URLSearchParams();

          if (typeFilter) params.append('typeId', typeFilter);
          if (startDate) params.append('dateFrom', startDate);
          if (endDate) params.append('dateTo', endDate);
          
          Object.entries(attrValues).forEach(([key, value]) => {
            if (value) params.append(`attr_${key}`, value);
          });

          let res;

          if (payload.role === 'emp') {
            res = await fetch(`${API_URL}/achieve/all/${payload.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          else {
            // alert(`${API_URL}/achieve/all?${params.toString()}`);
            res = await fetch(`${API_URL}/achieve/all?${params.toString()}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
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
    }, [token, typeFilter, startDate, endDate, attrValues]);

    useEffect(() => {
      const fetchAttrs = async () => {
        if (!typeFilter) {
          setAttrs([]);
          setAttrValues({});
          return;
        }
        try {
          const res = await fetch(`${API_URL}/achieve_type/${typeFilter}/attributes`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!res.ok) throw new Error("Ошибка при загрузке атрибутов");
          const data = await res.json();
          const valsRes = await fetch(`${API_URL}/achieve/attr-values/${typeFilter}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const valsData = await valsRes.json();

          const m = data.map(attr => ({
            id: attr.id, 
            name: attr.name,
            values: valsData[attr.id]?.values || []
          }))
          setAttrs(m);
          setAttrValues({});
        } catch (e) {
          setAttrs([]);
        }
      }
      fetchAttrs();
    }, [typeFilter, token])

    const attrChangeHandle = (id, value) => {
      setAttrValues((prev) => ({ ...prev, [id]: value }));
    };

    const displayed = achievements
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
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
        {payload.role === 'hr' && 
          <div style={styles.tabBar}>
            <button
              style={ tab === "achievements" ? styles.tabActive : styles.tab }
              onClick={() => setTab("achievements")}
            >
              Достижения
            </button>
            <button
              style={ tab === "types" ? styles.tabActive : styles.tab }
              onClick={() => setTab("types")}
            >
              Типы достижений
            </button>
          </div>
        }
        <h1 style={styles.title}>
                {payload.role === "emp"
                  ? "Ваши достижения"
                  : "Все достижения компании"
                }
              </h1>
        {tab === "achievements" ? (
        <>
          {loading && <p style={styles.status}>Загрузка...</p>}
          {error && (
            <p style={{ ...styles.status, color: "#d93025" }}>{error}</p>
          )}
          {!loading && !error && (
            <>
              <div style={styles.buttonGroup}>
                {payload.role === "hr" && (
                  <Link
                    to="/dashboard/createAchieveType"
                    style={styles.button}
                  >
                    Создать тип достижения
                  </Link>
                )}
                <Link to="/dashboard/createAchievement" style={styles.button}>
                  Добавить достижение
                </Link>
              </div>

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

                {payload.role !== "emp" && (
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
                )}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.inputDate}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.inputDate}
                />
                <input
                  type="text"
                  placeholder="Поиск по названию или имени"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.inputSearch}
                />
              </div>

              {attrs.length > 0 && (
                <div style={{ ...styles.controls, marginTop: 8 }}>
                  {attrs.map((attr) => (
                    <div
                      key={attr.id}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      <label
                        style={{ display: "block", marginBottom: 4 }}
                      >
                        {attr.name}
                      </label>
                      {attr.values.length > 0 ? (
                        <select
                          style={styles.select}
                          value={attrValues[attr.id] || ""}
                          onChange={(e) =>
                            attrChangeHandle(attr.id, e.target.value)
                          }
                        >
                          <option value="">— Любое —</option>
                          {attr.values.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          style={styles.inputSearch}
                          placeholder={attr.name}
                          value={attrValues[attr.id] || ""}
                          onChange={(e) =>
                            attrChangeHandle(attr.id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
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
                        <td style={styles.td}>
                          {a.user.name} {a.user.surname}
                        </td>
                        <td style={styles.td}>{roles[a.user.role]}</td>
                        <td style={styles.td}>{a.typeName}</td>
                        <td style={styles.td}>
                          <Link
                            to={`/dashboard/achievement/${a.id}`}
                            style={{ color: "black" }}
                          >
                            {a.name}
                          </Link>
                        </td>
                        <td style={styles.td}>
                          {format(parseISO(a.date), "dd.MM.yyyy")}
                        </td>
                      </tr>
                    ))}
                    {displayed.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", padding: "1rem" }}
                        >
                          Нет достижений по заданным фильтрам
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Название</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {types.map((type, i) => (
                <tr key={type.id} style={getRowStyle(i)}>
                  <td style={styles.td}>{type.name}</td>
                  <td style={styles.td}><Link to={`/dashboard/achieveType/${type.id}`} style={{textDecoration: "none", color: "#0077cc"}}>Перейти...</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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
    tabBar: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1rem",
    },
    tab: {
      padding: "0.5rem 1rem",
      backgroundColor: "#e0e0e0",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
    },
    tabActive: {
      padding: "0.5rem 1rem",
      backgroundColor: "#0077cc",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
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
    inputDate: {
      padding: "0.5rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
      minWidth: "160px",
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
