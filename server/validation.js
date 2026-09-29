import { MIN_PASSWORD_LENGTH } from "../shared/domain.js";
import { HTTP_STATUS, HttpError } from "./http.js";

function isBlank(value) {
  return value === undefined || value === null || value === "";
}

export function assertRequiredFields(body, fieldNames, message) {
  const hasMissingField = fieldNames.some((fieldName) => isBlank(body[fieldName]));
  if (hasMissingField) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, message);
  }
}

export function assertValidPassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function assertIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "Data inválida. Use o formato AAAA-MM-DD.");
  }
}

export function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "Identificador inválido.");
  }
  return id;
}
