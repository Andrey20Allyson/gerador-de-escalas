import _ from "lodash";

const protokeys = new Map<any, string>();
const protos = new Map<string, any>();

const protokeyPropertyName = "__protokey__";

export function saveProtokey(constructor: Function, filename: string) {
  const key = `${filename}`;

  protokeys.set(constructor.prototype, key);
  protos.set(key, constructor.prototype);
}

export function cloneAndInscribeProto<T>(entry: T): T {
  const entryClone = _.cloneDeep(entry);

  inscribeProto(entryClone);

  return entryClone;
}

export function inscribeProto(entry: unknown) {
  eachObject(entry, (object) => {
    const protokey = protokeys.get(object.__proto__);
    if (protokey == null) {
      return;
    }

    object[protokeyPropertyName] = protokey;
  });
}

export function resolveProto<T>(entry: T): T {
  eachObject(entry, (object) => {
    const protokey = object[protokeyPropertyName];
    if (protokey == null) {
      return;
    }

    const proto = protos.get(protokey);
    if (proto == null) {
      return;
    }

    Object.setPrototypeOf(object, proto);

    delete object[protokeyPropertyName];
  });

  return entry;
}

function eachObject(
  input: unknown,
  executor: (object: any) => void,
  know = new Set<any>(),
): void {
  if (typeof input != "object" || input == null || know.has(input)) {
    return;
  }

  executor(input);
  know.add(input);

  return Object.values(input).forEach((value) =>
    eachObject(value, executor, know),
  );
}
