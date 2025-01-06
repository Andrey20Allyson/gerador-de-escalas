import _path from 'path';

export function fromRoot(path: string) {
  const rootPath = _path.resolve(__dirname, '..');

  if (rootPath.endsWith('src')) {
    return _path.resolve(rootPath, '..', path);
  }

  return _path.resolve(rootPath, path);
}