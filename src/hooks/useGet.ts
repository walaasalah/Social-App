import axios from "axios";
import { useEffect, useState } from "react";

export default function useGet<T>(source: string | (() => Promise<T>)) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function getData() {
      setIsLoading(true);
      setError("");
      setData(null);
      try {
        if (typeof source === "string" && !source) return;
        const result =
          typeof source === "function"
            ? await source()
            : (
                await axios.get<T>(source, {
                  signal: controller.signal,
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                  },
                })
              ).data;
        if (active) setData(result);
      } catch (error) {
        if (active) {
          setError(
            axios.isAxiosError(error)
              ? error.response?.data?.message ||
                  "Could not load posts. Please try again."
              : "Could not load posts. Please try again.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void getData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [source, attempt]);

  return {
    data,
    isLoading,
    error,
    refetch: () => setAttempt((value) => value + 1),
  };
}
