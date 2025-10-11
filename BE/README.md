# BE

### Image inventory
Keep all your images in `./images/` folder. When we run the next step, it'll use this folder
to know what image paths to add in the database.

### Run migration to create table and add image list
```bash
bun run db:reset && bun run db:migrate
```

### To run the server
```bash
bun start
```

This project was created using `bun init` in bun v1.2.23. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
