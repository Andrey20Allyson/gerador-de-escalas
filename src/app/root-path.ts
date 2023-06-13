import _path from 'path';

export function fromRoot(path: string) {
  return _path.join(__dirname, '..', path);
}