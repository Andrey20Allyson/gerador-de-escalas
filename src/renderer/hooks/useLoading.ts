import { sleep } from "@gde/renderer/utils";
import { useState } from "react";

export default function useLoading() {
  const [loading, setLoading] = useState(false);

  async function listen<T>(promise: Promise<T>): Promise<T> {
    setLoading(true);

    await sleep();

    let result: Promise<T>;

    try {
      result = Promise.resolve(await promise);
    } catch (e) {
      result = Promise.reject(e);
    } finally {
      setLoading(false);
    }

    return result;
  }

  return { loading, listen };
}