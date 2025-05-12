import React from "react";

const ProfilePage = () => {
  
    return (
        <div style={styles.container}>
          <div style={styles.profileCard}>
            <h2 style={styles.name}>Анастасия Донская</h2>
            <p style={styles.role}>Сотрудник</p>
            <p style={styles.bio}>
              nastya@gmail.com
            </p>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <h3 style={styles.statNumber}>Юниторг</h3>
                <p style={styles.statLabel}>Компания</p>
              </div>
              <div style={styles.statItem}>
                <h3 style={styles.statNumber}>22</h3>
                <p style={styles.statLabel}>Возраст</p>
              </div>
            </div>
            <button style={styles.editButton}>Редактировать профиль</button>
          </div>
        </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Segoe UI, sans-serif",
    background: "linear-gradient(to right, #e4eff7, #a6c7f7)",
    minHeight: "70vh",
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
    transition: "transform 0.3s ease",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "1rem",
    border: "4px solid #0056b3",
  },
  name: {
    fontSize: "1.8rem",
    marginBottom: "0.5rem",
    color: "#2c3e50",
  },
  role: {
    fontSize: "1rem",
    color: "#777",
    marginBottom: "1rem",
  },
  bio: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "2rem",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "2rem",
  },
  statItem: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#777",
  },
  editButton: {
    padding: "0.85rem 1.5rem",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default ProfilePage;
