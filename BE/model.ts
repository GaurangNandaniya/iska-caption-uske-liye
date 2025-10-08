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

export function getImage({ id }) {
  using db = getDB();
  using query = db.query("select * from image as i where i.id = $id");

  return query.get({ $id: id });
}

export function getImageCount() {
  using db = getDB();
  using query = db.query("select count(*) as count from image;");

  return query.get().count;
}

export function createImageResponse({ username, caption, imageId }) {
  if (!username) {
    return { error: "Invalid username" };
  }

  if (!caption) {
    return { error: "Invalid caption" };
  }

  if (!imageId) {
    return { error: "Invalid imageId" };
  }

  using db = getDB();
  using query = db.query(
    `insert into image_response (fk_image_id, caption, created_by_username)
    values ($imageId, $caption, $username) returning *;`,
  );

  return query.get({
    $username: username,
    $caption: caption,
    $imageId: imageId,
  });
}

export function getAllImageResponses() {
  using db = getDB();
  using query = db.query(`select * from image_response;`);

  return query.all();
}
