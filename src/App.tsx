import { useEffect, useState } from "react";
import "./App.css";
import { getPatients } from "./services/patientService";
import { emptyPatient, type Patient, type PatientForm } from "./types/patient";

const API_URL = "http://localhost:3000/patients";

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<PatientForm>(emptyPatient);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPatients() {
      try {
        const data = await getPatients();

        if (!cancelled) {
          setPatients(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar pacientes:", error);

        if (!cancelled) {
          setMessage("Não foi possível carregar os pacientes.");
          setLoading(false);
        }
      }
    }

    fetchPatients();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshPatients() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Erro ao buscar pacientes.");
      }

      const data = await response.json();

      setPatients(data.patients);
    } catch (error) {
      console.error("Erro ao atualizar pacientes:", error);
      setMessage("Não foi possível atualizar a lista de pacientes.");
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      if (editingId !== null) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message || "Erro ao editar paciente.",
          );
        }

        setMessage("Paciente atualizado com sucesso!");
        setForm(emptyPatient);
        setEditingId(null);

        await refreshPatients();

        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Erro ao cadastrar paciente.",
        );
      }

      setMessage("Paciente cadastrado com sucesso!");
      setForm(emptyPatient);

      await refreshPatients();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);

      if (error instanceof TypeError) {
        setMessage(
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.",
        );
      } else if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Não foi possível salvar o paciente.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(patient: Patient) {
    setForm({
      name: patient.name,
      cpf: patient.cpf,
      birthDate: patient.birthDate ? patient.birthDate.substring(0, 10) : "",
      phone: patient.phone,
      email: patient.email || "",
      address: patient.address || "",
    });

    setEditingId(patient.id);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    const patient = patients.find((item) => item.id === id);

    if (!patient || deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o paciente "${patient.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Erro ao excluir paciente.",
        );
      }

      if (editingId === id) {
        setForm(emptyPatient);
        setEditingId(null);
      }

      setMessage("Paciente excluído com sucesso!");

      await refreshPatients();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);

      if (error instanceof TypeError) {
        setMessage(
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.",
        );
      } else if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Não foi possível excluir o paciente.");
      }
    } finally {
      setDeletingId(null);
    }
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

  function formatBirthDate(date: string) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("pt-BR");
  }

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

              <p>
                {editingId !== null
                  ? "Altere os dados do paciente."
                  : "Preencha os dados abaixo."}
              </p>
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
                  disabled={saving}
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : editingId !== null
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

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>

              <h3>Carregando pacientes...</h3>

              <p>Aguarde enquanto buscamos os registros.</p>
            </div>
          ) : filteredPatients.length === 0 ? (
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

                      <td>{formatBirthDate(patient.birthDate)}</td>

                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="action-edit"
                            onClick={() => handleEdit(patient)}
                            disabled={deletingId !== null}
                            aria-label={`Editar ${patient.name}`}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="action-delete"
                            onClick={() => handleDelete(patient.id)}
                            disabled={deletingId !== null}
                            aria-label={`Excluir ${patient.name}`}
                          >
                            {deletingId === patient.id
                              ? "Excluindo..."
                              : "Excluir"}
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
