/**
 * Cotação do dólar (USD → BRL) via AwesomeAPI (gratuita, sem chave).
 * Cacheada por 30 min. Em caso de falha, usa um valor de fallback.
 */
export async function getCotacaoDolar(): Promise<number> {
  try {
    const res = await fetch(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL",
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error("cotacao");
    const data = await res.json();
    const bid = Number(data?.USDBRL?.bid);
    return bid > 0 ? Number(bid.toFixed(4)) : 5;
  } catch {
    return 5;
  }
}

export function brl(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function usd(n: number) {
  return (
    "$ " +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Data de hoje no fuso de São Paulo, formato YYYY-MM-DD */
export function hojeSP() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // YYYY-MM-DD
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function nomeMes(mesIndex0: number) {
  return MESES[mesIndex0] ?? "";
}

/** "2026-06" → "Junho 2026" */
export function labelMesAno(chave: string) {
  const [ano, mes] = chave.split("-");
  return `${nomeMes(Number(mes) - 1)} ${ano}`;
}
