import { useEffect, useState } from "react";
import "./App.css";

interface Patient {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}

const emptyPatient: Omit<Patient, "id"> = {
  name: "",
  cpf: "",
  birthDate: "",
  phone: "",
  email: "",
  address: "",
};

function App() {
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem("patients");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(emptyPatient);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId !== null) {
      setPatients((previous) =>
        previous.map((patient) =>
          patient.id === editingId ? { ...patient, ...form } : patient,
        ),
      );

      setMessage("Paciente atualizado com sucesso!");
    } else {
      const newPatient: Patient = {
        id: Date.now(),
        ...form,
      };

      setPatients((previous) => [...previous, newPatient]);
      setMessage("Paciente cadastrado com sucesso!");
    }

    setForm(emptyPatient);
    setEditingId(null);
  }

  function handleEdit(patient: Patient) {
    const { id, ...patientData } = patient;

    setForm(patientData);
    setEditingId(id);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este paciente?",
    );

    if (!confirmed) return;

    setPatients((previous) => previous.filter((patient) => patient.id !== id));

    if (editingId === id) {
      cancelEdit();
    }

    setMessage("Paciente excluído com sucesso!");
  }

  function cancelEdit() {
    setForm(emptyPatient);
    setEditingId(null);
    setMessage("");
  }

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.cpf}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">+</span>
          <span>
            Clínica<span className="brand-light">Care</span>
          </span>
        </a>

        <span className="topbar-label">Gestão de pacientes</span>
      </header>

      <section className="page-heading">
        <div>
          <span className="eyebrow">PAINEL ADMINISTRATIVO</span>
          <h1>Pacientes</h1>
          <p>Cadastre e gerencie os pacientes da clínica.</p>
        </div>

        <div className="patient-counter">
          <span>Total de pacientes</span>
          <strong>{patients.length}</strong>
        </div>
      </section>

      <section className="content">
        <div className="form-card">
          <div className="section-heading">
            <div className="heading-icon">+</div>
            <div>
              <h2>
                {editingId !== null ? "Editar paciente" : "Novo paciente"}
              </h2>
              <p>Preencha os dados abaixo.</p>
            </div>
          </div>

          {message && (
            <div className="feedback" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Nome completo *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nome completo do paciente"
                required
              />
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="cpf">CPF *</label>
                <input
                  id="cpf"
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="birthDate">Data de nascimento *</label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Telefone *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="paciente@email.com"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="address">Endereço</label>
              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro e cidade"
              />
            </div>

            <div className="form-actions">
              {editingId !== null && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={cancelEdit}
                >
                  Cancelar
                </button>
              )}

              <button type="submit" className="button button-primary">
                {editingId !== null
                  ? "Salvar alterações"
                  : "Cadastrar paciente"}
              </button>
            </div>
          </form>
        </div>

        <div className="list-card">
          <div className="list-heading">
            <div>
              <h2>Pacientes cadastrados</h2>
              <p>Consulte e gerencie os registros.</p>
            </div>

            <span className="list-count">
              {filteredPatients.length} registro(s)
            </span>
          </div>

          <div className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou CPF..."
              aria-label="Buscar pacientes por nome ou CPF"
            />
          </div>

          {filteredPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♧</div>
              <h3>
                {search
                  ? "Nenhum paciente encontrado"
                  : "Nenhum paciente cadastrado"}
              </h3>
              <p>
                {search
                  ? "Tente pesquisar com outro nome ou CPF."
                  : "Os pacientes cadastrados aparecerão aqui."}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Nascimento</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patient-name">
                          <span className="avatar">
                            {patient.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{patient.name}</strong>
                            <small>{patient.email || "Sem e-mail"}</small>
                          </div>
                        </div>
                      </td>
                      <td>{patient.cpf}</td>
                      <td>{patient.phone}</td>
                      <td>
                        {patient.birthDate
                          ? new Date(
                              `${patient.birthDate}T12:00:00`,
                            ).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="action-edit"
                            onClick={() => handleEdit(patient)}
                            aria-label={`Editar ${patient.name}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="action-delete"
                            onClick={() => handleDelete(patient.id)}
                            aria-label={`Excluir ${patient.name}`}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        ClínicaCare · Sistema de cadastro de pacientes
      </footer>
    </main>
  );
}

export default App;
