export const UserRoles = {
  ADMIN: 'admin',
  MEDICO: 'medico',
  PACIENTE: 'paciente',
};

export function createUser({
  id = null, nome, email,
  role = UserRoles.PACIENTE,
  criadoEm = new Date().toISOString(),
} = {}) {
  return { id, nome, email, role, criadoEm };
}

export const UserSchema = {
  id: 'uuid | string',
  nome: 'string',
  email: 'string',
  role: 'admin | medico | paciente',
  criadoEm: 'ISO 8601 timestamp',
};
