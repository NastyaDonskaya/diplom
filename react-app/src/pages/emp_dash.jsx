import React from "react";

const EmployeeDashboard = () => {
  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Мои показатели</h2>
        <div style={styles.cardRow}>
          <div style={styles.card}>
            <p style={styles.cardTitle}>Пунктуальность</p>
            <p style={styles.cardValue}>95%</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardTitle}>Завершенные задачи</p>
            <p style={styles.cardValue}>42</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardTitle}>Среднее время работы в день</p>
            <p style={styles.cardValue}>3.5 ч</p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Последние достижения</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>Доклад</li>
          <li style={styles.listItem}>Проект</li>
          <li style={styles.listItem}>Выступление на конференции</li>
        </ul>
      </section>

      <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Мои отчёты</h2>
          <div style={styles.reportList}>
            <div style={styles.reportCard}>
              <p style={styles.reportTitle}>Отчёт 3</p>
              <p style={styles.reportDate}>Создан: 01.04.2025</p>
              <button style={styles.reportButton}>Просмотреть</button>
            </div>
            <div style={styles.reportCard}>
              <p style={styles.reportTitle}>Отчёт 2</p>
              <p style={styles.reportDate}>Создан: 01.03.2025</p>
              <button style={styles.reportButton}>Просмотреть</button>
            </div>
            <div style={styles.reportCard}>
              <p style={styles.reportTitle}>Отчёт 1</p>
              <p style={styles.reportDate}>Создан: 01.02.2025</p>
              <button style={styles.reportButton}>Просмотреть</button>
            </div>
          </div>
          <button style={styles.button}>Сформировать новый отчёт</button>
        </section>

    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
    color: "#2c3e50",
    background: "linear-gradient(to right, #e4eff7, #a6c7f7)",
  },
  section: {
    marginBottom: "2.5rem",
    padding: "1.5rem",
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
    fontWeight: "600",
    color: "#333",
  },
  cardRow: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  card: {
    background: "rgba(255, 255, 255, 0.55)",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    minWidth: "180px",
    flex: "1",
    backdropFilter: "blur(10px)",
  },
  cardTitle: {
    fontSize: "0.95rem",
    color: "#777",
    marginBottom: "0.5rem",
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#0056b3",
  },
  list: {
    paddingLeft: "1rem",
  },
  listItem: {
    marginBottom: "0.6rem",
    fontSize: "1rem",
  },
  button: {
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
  reportList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  reportCard: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  reportTitle: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#2c3e50",
    margin: "0",
  },
  reportDate: {
    fontSize: "0.9rem",
    color: "#555",
    margin: "0.5rem 0",
  },
  reportButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default EmployeeDashboard;
