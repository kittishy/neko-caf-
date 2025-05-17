import dotenv from 'dotenv';
dotenv.config();

import { bootstrap } from "#base";
import { startServer } from "#server";

await bootstrap({ 
    meta: import.meta,
    whenReady: startServer
});