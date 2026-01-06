import * as restate from "@restatedev/restate-sdk";
import { soaWorkflow } from "./workflows/soaWorkflow";
import { soaProcessingWorkflow } from "./workflows/soaProcessingWorkflow";

restate.serve({
  services: [soaWorkflow, soaProcessingWorkflow],
  port: 9080,
});
