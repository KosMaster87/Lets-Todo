/**
 * @fileoverview Namespaces dynamically created user schemas by environment.
 */

export const createUserDbName = (namespace, email) => {
  const emailHash = Buffer.from(email).toString("hex").slice(0, 24);
  return `todos_${namespace}_user_${emailHash}`;
};
