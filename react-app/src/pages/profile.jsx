import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = 'http://localhost:5000/api';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/user/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Ошибка при загрузке профиля");
        }

        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {loading ? (
          <p style={styles.loading}>Загрузка...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <>
            <h2 style={styles.name}>
              {profile.name} {profile.surname}
            </h2>
            <p style={styles.role}>
              {profile.role === "emp"
                ? "Сотрудник"
                : profile.role === "ceo"
                ? "Руководитель"
                : profile.role === "hr"
                ? "HR-менеджер"
                : profile.role}
            </p>
            <p style={styles.email}>{profile.email}</p>

            <div style={styles.stats}>
              <div>
                <h3 style={styles.statValue}>{profile.company.name}</h3>
                <p style={styles.statLabel}>Компания</p>
              </div>
              <div>
                <h3 style={styles.statValue}>{profile.age}</h3>
                <p style={styles.statLabel}>Возраст</p>
              </div>
            </div>

            <button style={styles.button}>Редактировать профиль</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, rgb(228, 239, 247), #a6c7f7)",
    padding: "1rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "480px",
    textAlign: "center",
  },
  name: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#2c3e50",
  },
  role: {
    fontSize: "1rem",
    color: "#777",
    marginBottom: "1rem",
  },
  email: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "2rem",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "2rem",
  },
  statValue: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#0056b3",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#666",
  },
  button: {
    padding: "0.85rem",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  error: {
    color: "red",
    fontWeight: "500",
  },
  loading: {
    fontSize: "1rem",
    color: "#333",
  },
};

export default ProfilePage;
