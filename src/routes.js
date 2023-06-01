import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";
import { Database } from "./database.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      let tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (title && description) {
        database.insert("tasks", {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date().toLocaleString(),
          updated_at: new Date().toLocaleString(),
        });

        return res.writeHead(201).end();
      }

      return res
        .writeHead(400)
        .end(JSON.stringify({ message: "Faltando propriedades" }));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (title && description) {
        try {
          database.update("tasks", id, {
            title,
            description,
            updated_at: new Date().toLocaleString(),
          });

          return res.writeHead(204).end();
        } catch (e) {
          return res.writeHead(400).end(JSON.stringify({ message: e.message }));
        }
      }

      return res
        .writeHead(400)
        .end(JSON.stringify({ message: "Missing properties" }));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      database.patch("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks/csv"),
    handler: (req, res) => {
      req.body.tasks.forEach(({ title, description }) =>
        database.insert("tasks", {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date().toLocaleString(),
          updated_at: new Date().toLocaleString(),
        })
      );
      return res.writeHead(204).end();
    },
  },
];
