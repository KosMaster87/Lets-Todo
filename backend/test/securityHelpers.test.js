import assert from "node:assert/strict";
import test from "node:test";
import { createUserDbName } from "../routing/helpers/databaseNameHelpers.js";
import { createSessionToken, hashSessionToken } from "../routing/helpers/sessionTokenHelpers.js";

test("session tokens are opaque, unique and stored as SHA-256 hashes", () => {
  const firstToken = createSessionToken();
  const secondToken = createSessionToken();

  assert.match(firstToken, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(firstToken, secondToken);
  assert.equal(hashSessionToken(firstToken).length, 64);
  assert.notEqual(hashSessionToken(firstToken), firstToken);
});

test("user schemas cannot collide across environments", () => {
  const email = "user@example.test";

  assert.equal(
    createUserDbName("production", email),
    "todos_production_user_75736572406578616d706c65"
  );
  assert.equal(createUserDbName("staging", email), "todos_staging_user_75736572406578616d706c65");
});
