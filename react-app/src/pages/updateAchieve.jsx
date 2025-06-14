import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';

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

const  EditAchievement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [achieveTypes, setAchieveTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [values, setValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/achieve/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Не удалось загрузить достижение');
        const data = await res.json();
        setName(data.name);
        setDescription(data.description);
        setDate(data.date);
        setUserId(data.user.id);
        setSelectedTypeId(data.achieveTypeId || data.typeId);
        const attrMap = {};
        data.attributes.forEach(a => {
          attrMap[a.achieveTypeAttributeId] = a.value;
        });
        setValues(attrMap);
      } catch (e) {
        alert(e.message);
      }
    };
    fetchData();
  }, [id, token]);

  useEffect(() => {
    const inf = async () => {
      try {
        const typeRes = await fetch(`${API_URL}/achieve_type`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const typeData = await typeRes.json();
        setAchieveTypes(typeData);
        if (payload.role === 'emp') {
          setUsers([{ id: payload.id, name: payload.name, surname: payload.surname, email: payload.email }]);
        } else {
          const memRes = await fetch(`${API_URL}/user/members`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const memData = await memRes.json();
          setUsers(memData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    inf();
  }, [token]);

  useEffect(() => {
    if (!selectedTypeId) return;
    const fetchAttrs = async () => {
      try {
        const res = await fetch(`${API_URL}/achieve_type/${selectedTypeId}/attributes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ошибка при загрузке атрибутов');
        const data = await res.json();
        setAttributes(data);
      } catch (e) {
        alert(e.message);
      }
    };
    fetchAttrs();
  }, [selectedTypeId, token]);

  const handleChange = (attrId, value) => {
    setValues(prev => ({ ...prev, [attrId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payloadBody = {
      name,
      description,
      date,
      userId: parseInt(userId),
      attributes: attributes.map(attr => ({
        attributeId: attr.id,
        value: values[attr.id] || ''
      }))
    };
    try {
      const res = await fetch(`${API_URL}/achieve/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payloadBody)
      });
      if (res.ok) {
        alert('Достижение обновлено!');
        navigate(-1);
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch {
      alert('Ошибка сети');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Редактирование достижения</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Название:</label>
          <input value={name} onChange={e => setName(e.target.value)} style={styles.input} required />

          <label style={styles.label}>Описание:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...styles.input, height: '80px' }} />

          <label style={styles.label}>Дата:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} required />

          <label style={styles.label}>Сотрудник:</label>
          <select value={userId} onChange={e => setUserId(e.target.value)} style={styles.select} required>
            <option value="">Сотрудник</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} {user.surname} ({user.email})
              </option>
            ))}
          </select>

          <label style={styles.label}>Тип:</label>
          <select value={selectedTypeId} onChange={e => setSelectedTypeId(e.target.value)} style={styles.select} required>
            <option value="">Тип достижения</option>
            {achieveTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          {attributes.length > 0 && (
            <>
              <label style={styles.label}>Атрибуты:</label>
              {attributes.map(attr => (
                <div key={attr.id}>
                  <label>{attr.name}</label>
                  
                  {attr.dataType === 'ENUM' ? (
                    <select
                      style={styles.select}
                      value={values[attr.id] || ''}
                      onChange={(e) => handleChange(attr.id, e.target.value)}
                      required={attr.isRequired}
                    >
                      <option value="">Выберите</option>
                      {attr.enumValues.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      style={styles.input}
                      type="text"
                      value={values[attr.id] || ''}
                      onChange={(e) => handleChange(attr.id, e.target.value)}
                      required={attr.isRequired}
                    />
                  )}
                </div>
              ))}
            </>
          )}

          <button type="submit" style={styles.button}>Сохранить</button>
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

export default EditAchievement;