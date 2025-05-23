import { useState } from 'react';

export default function CreateAchieveType() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState([
    { name: '', dataType: 'STRING', isRequired: false },
  ]);

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { name: '', dataType: 'STRING', isRequired: false },
    ]);
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { name, description, attributes }
    const token = localStorage.getItem("token")

    try {
      const response = await fetch('http://localhost:5000/api/achieve_type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Тип достижения создан!');
        setName('');
        setDescription('');
        setAttributes([{ name: '', dataType: 'STRING', isRequired: false }]);
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message || 'Не удалось создать'}`);
      }
    } catch {
      alert('Сервер не отвечает');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Создание типа достижения</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Название типа:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
            placeholder="Введите название"
          />

          <label style={styles.label}>Описание:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...styles.input, resize: 'vertical', height: '80px' }}
            placeholder="Введите описание"
          />

          <label style={styles.label}>Атрибуты:</label>
          {attributes.map((attr, index) => (
            <div key={index} style={styles.attributeRow}>
              <input
                value={attr.name}
                onChange={(e) =>
                  handleAttributeChange(index, 'name', e.target.value)
                }
                placeholder="Название атрибута"
                required
                style={styles.input}
              />
              <select
                value={attr.dataType}
                onChange={(e) =>
                  handleAttributeChange(index, 'dataType', e.target.value)
                }
                style={styles.select}
              >
                <option value="STRING">Строка</option>
                <option value="NUMBER">Число</option>
                <option value="DATE">Дата</option>
              </select>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={attr.isRequired}
                  onChange={(e) =>
                    handleAttributeChange(index, 'isRequired', e.target.checked)
                  }
                />
                Обяз.
              </label>
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                style={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addAttribute}
            style={styles.buttonOutline}
          >
            + Добавить атрибут
          </button>

          <button type="submit" style={styles.button}>
            Создать тип достижения
          </button>
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
