import { AppError } from "../../../apploader/api/mapping/error";
import { WorkerRegistry } from "src/lib/persistence/entities/worker-registry";
import { api } from "../../api";
import { AtonHook } from "../../utils/state";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";

class WorkerRegistriesService {
  private _registries = new AtonHook<WorkerRegistry[]>([]);
  private _error = new AtonHook<AppError<unknown> | null>(null);
  private _loading = new AtonHook<boolean>(true);

  constructor() {
    useEffect(() => {
      this._load();
    }, []);
  }

  private async _load() {
    this._loading.set(true);
    const entriesResp = await api.config.workers.list();

    if (entriesResp.ok) {
      this._registries.set(entriesResp.data);
    } else {
      this._error.set(entriesResp.error);
    }

    this._loading.set(false);
  }

  list(): WorkerRegistry[] {
    return this._registries.get();
  }

  isLoading() {
    return this._loading.get();
  }

  getError(): AppError<unknown> | null {
    return this._error.get();
  }

  refresh() {
    this._load();
  }

  filter() {}

  loadMore(amount: number) {}
}

const context = createContext<WorkerRegistriesService | null>(null);

export function WorkerRegistriesProvider(props: PropsWithChildren) {
  const { children } = props;

  const service = new WorkerRegistriesService();

  return <context.Provider value={service}>{children}</context.Provider>;
}

export function useWorkerRegistriesService(): WorkerRegistriesService {
  const ctx = useContext(context);
  if (ctx === null)
    throw new Error(
      `Can't use WorkerRegistriesService outside a WorkerRegistriesProvider`,
    );
  return ctx;
}
