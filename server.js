"use strict";

import app from "./app.js";
import { PORT } from "./config/config.js";


app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
