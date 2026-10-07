import type { Patient, PatientForm } from "../types/patient";

const API_URL = "http://localhost:3000/patients";

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Ocorreu um erro na comunicação com o servidor.",
    );
  }

  return data;
}

export async function getPatients(): Promise<Patient[]> {
  const response = await fetch(API_URL);
  const data = await handleResponse(response);

  return data.patients;
}

export async function createPatient(patient: PatientForm): Promise<Patient> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patient),
  });

  return handleResponse(response);
}

export async function updatePatient(
  id: number,
  patient: PatientForm,
): Promise<Patient> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patient),
  });

  return handleResponse(response);
}

export async function deletePatient(id: number) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}
