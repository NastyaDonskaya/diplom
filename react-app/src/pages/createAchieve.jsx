import { useEffect, useState } from 'react';

export default function CreateAchievement() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');
  const [achieveTypes, setAchieveTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [values, setValues] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/achieve_type', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAchieveTypes(data);
      } catch  {
        alert('Ошибка при загрузке типов достижений');
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    if (!selectedTypeId) return;

    const fetchAttrs = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/achieve_type/${selectedTypeId}/attributes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAttributes(data);
      } catch {
        alert('Ошибка при загрузке атрибутов');
      }
    };

    fetchAttrs();
  }, [selectedTypeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      date,
      userId: parseInt(userId),
      achieveTypeId: parseInt(selectedTypeId),
      attributes: attributes.map(attr => ({
        attributeId: attr.id,
        value: values[attr.id] || ''
      }))
    };

    try {
      const res = await fetch('http://localhost:5000/api/achieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Достижение успешно создано!');
        setName('');
        setDescription('');
        setDate('');
        setUserId('');
        setSelectedTypeId('');
        setAttributes([]);
        setValues({});
      } else {
        const data = await res.json();
        alert(`Ошибка: ${data.message || 'Не удалось создать достижение'}`);
      }
    } catch {
      alert('Ошибка при отправке запроса');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Создание достижения</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Название:</label>
          <input value={name} onChange={e => setName(e.target.value)} style={styles.input} required />

          <label style={styles.label}>Описание:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...styles.input, height: '80px' }} />

          <label style={styles.label}>Дата:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} required />

          <label style={styles.label}>ID пользователя:</label>
          <input type="number" value={userId} onChange={e => setUserId(e.target.value)} style={styles.input} required />

          <label style={styles.label}>Тип достижения:</label>
          <select value={selectedTypeId} onChange={e => setSelectedTypeId(e.target.value)} style={styles.select} required>
            <option value="">-- Выберите тип --</option>
            {achieveTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          {attributes.length > 0 && (
            <>
              <label style={styles.label}>Атрибуты:</label>
              {attributes.map(attr => (
                <div key={attr.id} style={styles.attributeRow}>
                  <label>{attr.name}:</label>
                  <input
                    type="text"
                    value={values[attr.id] || ''}
                    onChange={e => setValues({ ...values, [attr.id]: e.target.value })}
                    style={styles.input}
                    required={attr.isRequired}
                  />
                </div>
              ))}
            </>
          )}

          <button type="submit" style={styles.button}>Создать достижение</button>
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginLeft: '0.5rem',
  },
  attributeRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#d93025',
    fontSize: '1.2rem',
    cursor: 'pointer',
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
  buttonOutline: {
    padding: '0.7rem',
    border: '1px solid #0056b3',
    backgroundColor: 'transparent',
    color: '#0056b3',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
};
  
