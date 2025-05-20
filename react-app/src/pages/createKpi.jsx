import { useEffect, useState } from 'react';

export default function CreateKpiValue() {
  const [kpiTypes, setKpiTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchKpiTypes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/kpi_type', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setKpiTypes(data);
      } catch {
        alert('Ошибка при загрузке типов KPI');
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/members', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      } catch {
        alert('Ошибка при загрузке пользователей компании');
      }
    };

    fetchKpiTypes();
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedType = kpiTypes.find(t => t.id === parseInt(selectedTypeId));
    const payload = {
      kpiTypeId: parseInt(selectedTypeId),
      userId: parseInt(userId),
      description
    };

    if (selectedType?.calculationType === 'DEF') {
      if (!value) {
        alert('Введите значение KPI');
        return;
      }
      payload.value = parseFloat(value);
    }

    try {
      const res = await fetch('http://localhost:5000/api/kpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('KPI успешно создан!');
        setSelectedTypeId('');
        setUserId('');
        setValue('');
        setDescription('');
      } else {
        const data = await res.json();
        alert(`Ошибка: ${data.message || 'Не удалось создать KPI'}`);
      }
    } catch {
      alert('Сервер не отвечает');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Создание значения KPI</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Тип KPI:</label>
          <select value={selectedTypeId} onChange={e => setSelectedTypeId(e.target.value)} style={styles.select} required>
            <option value="">-- Выберите тип --</option>
            {kpiTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <label style={styles.label}>Сотрудник:</label>
          <select value={userId} onChange={e => setUserId(e.target.value)} style={styles.select} required>
            <option value="">-- Выберите сотрудника --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} {user.surname} ({user.email})
              </option>
            ))}
          </select>

          {kpiTypes.find(t => t.id === parseInt(selectedTypeId))?.calculationType === 'DEF' && (
            <>
              <label style={styles.label}>Значение KPI:</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} style={styles.input} required />
            </>
          )}

          <label style={styles.label}>Описание:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...styles.input, height: '80px' }} />

          <button type="submit" style={styles.button}>Создать KPI</button>
        </form>
      </div>
    </div>
  );
}


const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to right, #e4f2f9, #a6c7f7)',
    padding: '1rem',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '700px',
    width: '100%',
    fontFamily: 'Segoe UI, sans-serif',
    backdropFilter: 'blur(10px)',
  },
  title: {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#2c3e50',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: '#fff',
    marginLeft: '0.5rem',
  },
  button: {
    padding: '0.85rem',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem',
  },
};
