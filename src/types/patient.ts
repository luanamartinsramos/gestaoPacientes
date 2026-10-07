export interface Patient {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string | null;
  address: string | null;
}

export interface PatientForm {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}

export const emptyPatient: PatientForm = {
  name: "",
  cpf: "",
  birthDate: "",
  phone: "",
  email: "",
  address: "",
};
