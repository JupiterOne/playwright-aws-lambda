import { promises as fsPromises } from 'fs';

export default async function fileExists(path: string) {
  try {
    await fsPromises.access(path);
    return true;
  } catch (err) {
    return false;
  }
}
