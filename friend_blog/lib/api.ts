const DEFAULT_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

import type { AxiosRequestConfig } from "axios";
import axios from "../app/utils/axios";

type ApiFetchOptions = {
  raw?: boolean;
  body?: unknown;
} & Partial<AxiosRequestConfig>;

export type ApiRes = {
  ok: boolean;
  status: number;
  statusText: string;
};

export type ApiFetchResult = { res: ApiRes; data: unknown };

export async function apiFetch(
  input: string,
  opts: ApiFetchOptions = {}
): Promise<ApiFetchResult> {
  const url = input.startsWith("http") ? input : `${DEFAULT_BASE}${input}`;

  try {
    const axiosRes = await axios.request({
      url,
      method: (opts.method as AxiosRequestConfig["method"]) || "GET",
      data: opts.body ? JSON.parse(String(opts.body)) : undefined,
      headers: opts.headers,
      // allow passing any other axios options
      ...opts,
    });

    const res: ApiRes = {
      ok: axiosRes.status >= 200 && axiosRes.status < 300,
      status: axiosRes.status,
      statusText: axiosRes.statusText,
    };

    return { res, data: axiosRes.data };
  } catch (err: unknown) {
    type AxiosErr = {
      response?: { status?: number; data?: unknown; statusText?: string };
    };
    const axiosErr = err as AxiosErr;
    // If axios returned a response, mirror the status
    if (axiosErr?.response) {
      const resp = axiosErr.response;
      if (resp.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.dispatchEvent(
          new CustomEvent("api:error:401", { detail: { status: 401 } })
        );
      } else if (resp.status === 403 && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api:error:403", {
            detail: { status: 403, message: (resp.data as any)?.message },
          })
        );
      }
      return {
        res: {
          ok: false,
          status: resp.status ?? 0,
          statusText: resp.statusText ?? "",
        },
        data: resp.data,
      };
    }

    // network error
    return {
      res: { ok: false, status: 0, statusText: "network error" },
      data: null,
    };
  }
}

export default apiFetch;
