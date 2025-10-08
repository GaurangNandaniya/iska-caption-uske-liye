import { getDB } from "./db";
import { IMAGE_FOLDER_PATH } from "./constants.ts";

const imageNames = [
  "001.png",
  "002.png",
  "003.png",
  "004.png",
  "005.png",
  "006.png",
  "007.png",
  "008.png",
  "009.png",
  "010.png",
  "011.png",
  "012.png",
  "013.png",
  "014.png",
  "015.png",
  "016.png",
  "017.png",
  "018.png",
  "019.png",
  "020.png",
  "021.png",
  "022.png",
  "023.png",
  "024.png",
  "025.png",
  "026.png",
  "027.png",
];

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
        response_text text,
        created_by_username text,

        foreign key (fk_image_id) references image(id)
      );

      delete from image;
    `,
  );

  imageNames.forEach((imageName, index) => {
    using query = db.query(
      `
        insert into image (id, image_path) values ($index, $imagePath) on conflict do update set image_path = image_path;
      `,
    );

    query.run({ $index: index, $imagePath: IMAGE_FOLDER_PATH + imageName });
  });
}
