"use strict";

import app from "./app.js";
import * as config from "./config/config.js";

const { PORT } = config;

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
