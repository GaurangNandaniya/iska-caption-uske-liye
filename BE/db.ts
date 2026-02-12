import { Database } from "bun:sqlite";
import { DB_FILE_PATH } from "./constants";

export const getDB = () => new Database(DB_FILE_PATH);
