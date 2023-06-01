import http from "node:http";

import { json } from "./middleaware/json.js";
import { routes } from "./routes.js";
import { extractQueryParams } from "./utils/extract-query-params.js";
import { file } from "./middleaware/file.js";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  const route = routes.find((route) => {
    return route.method === method && route.path.test(url);
  });

  if (route && req.method === "POST" && req.url === "/tasks/csv") {
    await file(req, res);
    return route.handler(req, res);
  } else if (route) {
    await json(req, res);
    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    req.params = params;
    req.query = query ? extractQueryParams(query) : {};

    return route.handler(req, res);
  }
  return res.writeHead(404).end();
});

server.listen(3000);
