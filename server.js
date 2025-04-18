"use strict";

import app from "./app.js";
import { HOST, PORT } from "./config/config.js";


app.listen(PORT, function () {
  console.log(`Started on ${HOST}:${PORT}`);
});
