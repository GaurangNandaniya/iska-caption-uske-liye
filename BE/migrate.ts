import { getDB } from "./db";

{
  using db = getDB();
  using query = db.query(`
    create table if not exists user (
      id integer primary key autoincrement,
      username text not null unique
    );

    create table if not exists image (
      id integer primary key autoincrement,
      image_path text,
      is_already_captioned bool
    );
    
    create table if not exists image_response (
      id integer primary key autoincrement,
      fk_image_id integer not null,
      response_text text,
      created_by_username text,

      foreign key (fk_image_id) references public.image(id)
    );
  `);

  query.run();
}
