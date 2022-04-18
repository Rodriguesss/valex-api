export function unprocessableEntity(messageError: string) {
  return { type: 'unprocessable_entity', messageError };
}

export function notFound(messageError: string) {
  return { type: 'not_found', messageError };
}

export function conflict(messageError: string) {
  return { type: 'conflict', messageError };
}
