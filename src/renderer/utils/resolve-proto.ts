function mapProto(proto: Function) {}

function resolveProto(input: unknown) {
  if (input == null) {
    return;
  }

  if (typeof input != "object") {
    return;
  }

  Object.values(input).forEach(resolveProto);
}
