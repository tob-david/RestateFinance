import * as restate from "@restatedev/restate-sdk";
import { soaWorkflow } from "./workflows/soaWorkflow";

restate.serve({
  services: [soaWorkflow],
  port: 9080,
});
