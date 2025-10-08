import { getDB } from "./db";
import { readdirSync } from "fs";
import { IMAGE_FOLDER_PATH } from "./constants.ts";

const imageNames = readdirSync("./images").sort();

{
  using db = getDB();

  db.exec(
    `
      create table if not exists user (
        id integer primary key autoincrement,
        username text not null unique
      );

      create table if not exists image (
        id integer primary key,
        image_path text,
        is_already_captioned bool default false
      );

      create table if not exists image_response (
        id integer primary key autoincrement,
        fk_image_id integer not null,
        caption text,
        created_by_username text,

        foreign key (fk_image_id) references image(id)
      );

      delete from image;
    `,
  );

  imageNames.forEach((imageName: string, index: number) => {
    using query = db.query(
      `
        insert into image (id, image_path) values ($index, $imagePath) on conflict do update set image_path = image_path;
      `,
    );

    query.run({ $index: index, $imagePath: IMAGE_FOLDER_PATH + imageName });
  });
}
