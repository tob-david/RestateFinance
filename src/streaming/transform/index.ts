import { IStatementOfAccountModel } from "../../utils/types";
import { transformSoaRow } from "./soaTransformer";

export async function* transformSoaStream(
  source: AsyncIterable<any[]>
): AsyncGenerator<IStatementOfAccountModel, void, unknown> {
  for await (const row of source) {
    const model = transformSoaRow(row);
    if (model) yield model;
  }
}
