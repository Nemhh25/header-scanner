import { lookup } from "dns/promises";
import ipaddr from "ipaddr.js";

export class UnsafeUrlError extends Error {}

export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("URL inválida");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Apenas http e https são permitidos");
  }

  const results = await lookup(url.hostname, { all: true });

  for (const { address } of results) {
    const range = ipaddr.process(address).range();
    if (range !== "unicast") {
      throw new UnsafeUrlError(`Endereço não permitido (${range})`);
    }
  }

  return url;
}