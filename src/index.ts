import { bootstrap } from "#base";
import { startServer } from "#server";

await bootstrap({
    meta: import.meta,
    directories: ["../commands"],
    whenReady: startServer
});