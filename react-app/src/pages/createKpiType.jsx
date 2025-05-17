import { useEffect, useState } from 'react';

export default function CreateKpiType() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calculationType, setCalculationType] = useState('DEF');
  const [numType, setNumType] = useState(1);
  const [maxValue, setMaxValue] = useState('');
  const [achieveTypes, setAchieveTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrName, setSelectedAttrName] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/achieve_type', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAchieveTypes(data);
      } catch {
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
      calculationType,
      sourceAchieveTypeId: selectedTypeId ? parseInt(selectedTypeId) : null,
      sourceAtributeName: selectedAttrName || null,
      numType: parseInt(numType),
      maxValue: parseFloat(maxValue)
    };

    try {
      const response = await fetch('http://localhost:5000/api/kpi_type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Тип KPI создан!');
        setName('');
        setDescription('');
        setCalculationType('MIN');
        setSelectedTypeId('');
        setSelectedAttrName('');
        setMaxValue('');
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось создать KPI'}`);
      }
    } catch {
      alert('Сервер не отвечает');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Создание типа KPI</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Название:</label>
          <input value={name} onChange={e => setName(e.target.value)} style={styles.input} required />

          <label style={styles.label}>Описание:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...styles.input, height: '80px' }} />

          <label style={styles.label}>Тип расчета:</label>
          <select value={calculationType} onChange={e => setCalculationType(e.target.value)} style={styles.select}>
            <option value="MIN">Минимум</option>
            <option value="MAX">Максимум</option>
            <option value="AVG">Среднее</option>
            <option value="SUM">Сумма</option>
            <option value="COUNT">Количество</option>
            <option value="DEF">Вручную</option>
          </select>

        
          {calculationType !== 'DEF' && (
            <>
              <label style={styles.label}>Тип достижения (для источника):</label>
              <select value={selectedTypeId} onChange={e => setSelectedTypeId(e.target.value)} style={styles.select}>
                <option value="">-- Выберите тип --</option>
                {achieveTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </>
          )}

          {calculationType !== 'DEF' && calculationType !== 'COUNT' && attributes.length > 0 && (
            <>
              <label style={styles.label}>Атрибут источника:</label>
              <select
                value={selectedAttrName}
                onChange={e => setSelectedAttrName(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Выберите атрибут --</option>
                {attributes.map(attr => (
                  <option key={attr.name} value={attr.name}>{attr.name}</option>
                ))}
              </select>
            </>
          )}

          <label style={styles.label}>Тип значения:</label>
          <select value={numType} onChange={e => setNumType(e.target.value)} style={styles.select}>
            <option value={1}>Целое</option>
            <option value={2}>Дробное</option>
          </select>

          <label style={styles.label}>Макс. значение:</label>
          <input type="number" min="0" value={maxValue} onChange={e => setMaxValue(e.target.value)} style={styles.input} required />

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