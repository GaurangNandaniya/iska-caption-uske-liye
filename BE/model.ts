import { getDB } from "./db";

export function createUser({ username }) {
  if (!username) {
    return { error: "Some error" };
  }

  using db = getDB();
  using query = db.query(
    "insert into user (username) values ($username) on conflict (username) do nothing returning *",
  );

  return query.get({ $username: username });
}
