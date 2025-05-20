import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:5000/api";

const KpiCard = () => {
  const { userId, kpiTypeId } = useParams();
  const [kpiData, setKpiData] = useState([]);
  const [kpiType, setKpiType] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const resKpi = await fetch(
          `${API_URL}/kpi/vals/${userId}/${kpiTypeId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!resKpi.ok) {
          const errData = await resKpi.json();
          throw new Error(errData.message || "Ошибка при загрузке KPI");
        }
        const data = await resKpi.json();

        if (data.length === 0) {
          setError("Данные по KPI не найдены");
          setLoading(false);
          return;
        }

        setKpiType(data[0].kpi_type);

        const chartData = data
          .map((item) => ({
            date: new Date(item.createdAt).toLocaleDateString(),
            value: item.value,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setKpiData(chartData);

        const resUser = await fetch(`${API_URL}/user/profile/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resUser.ok) {
          setUserInfo(null);
        } else {
          const userData = await resUser.json();
          setUserInfo(userData);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, kpiTypeId, token]);

  if (loading) {
    return <p style={styles.status}>Загрузка данных KPI...</p>;
  }
  if (error) {
    return (
      <p style={{ ...styles.status, color: "#d93025" }}>
        Ошибка: {error}
      </p>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          Показатель: {kpiType?.name || "Неизвестно"}
        </h1>
        <p style={styles.description}>
          {kpiType?.description || "Описание отсутствует"}
        </p>

        {userInfo && (
          <div style={styles.userInfo}>
            <h3 style={styles.subTitle}>Владелец показателя:</h3>
            <p>
              <strong>Имя:</strong> {userInfo.name}
            </p>
            <p>
              <strong>Фамилия:</strong> {userInfo.surname}
            </p>
            <p>
              <strong>Роль:</strong> {userInfo.role}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email}
            </p>
          </div>
        )}

        <h3 style={styles.subTitle}>График изменений</h3>
        {kpiData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={kpiData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0056b3"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={styles.status}>Нет данных для отображения графика</p>
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    maxWidth: "700px",
    width: "100%",
  },
  title: {
    fontSize: "1.8rem",
    color: "#2c3e50",
    marginBottom: "0.5rem",
    fontWeight: "600",
  },
  description: {
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.5",
    marginBottom: "1.5rem",
  },
  userInfo: {
    marginBottom: "1.5rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  subTitle: {
    fontSize: "1.2rem",
    color: "#0056b3",
    marginBottom: "0.8rem",
  },
  status: {
    fontSize: "1rem",
    textAlign: "center",
    marginTop: "2rem",
    color: "#333",
  },
};

export default KpiCard;
