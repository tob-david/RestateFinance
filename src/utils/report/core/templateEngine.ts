import { Liquid } from "liquidjs";

const liquid = new Liquid({
  cache: process.env.NODE_ENV === "production",
});

export function renderTemplate(
  template: string,
  data: Record<string, any>
): Promise<string> {
  return liquid.parseAndRender(template, data);
}
