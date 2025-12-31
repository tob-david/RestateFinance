import * as restate from "@restatedev/restate-sdk";
import { soaProcessHandler } from "./handlers/soaProcessHandler";
import { customerService } from "./handlers/customersHandler";
import { soaWorkflow } from "./workflows/soaWorkflow";
import { soaProcessingWorkflow } from "./workflows/soaProcessingWorkflow";
import { batchService } from "./handlers/batchHandler";

restate.serve({
  services: [
    soaWorkflow,
    soaProcessingWorkflow,
    customerService,
    batchService,
    soaProcessHandler,
  ],
  port: 9080,
});
