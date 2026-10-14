import { dirname, resolve } from "@std/path";

export async function loadManifest(path: string): Promise<Manifest> {
  const manifestContent = await Deno.readTextFile(path);
  const manifestJson = JSON.parse(manifestContent) as ManifestJson;
  const dir = dirname(path);
  const normalized = normalize(manifestJson, dir);

  return new Manifest(normalized);
}

function normalize(json: ManifestJson, baseDir: string): ManifestJson {
  const assets = json.assets.map((asset) => normalizeAsset(asset, baseDir));

  return {
    assets,
  };
}

function normalizeAsset(json: AssetJson, basePath: string): AssetJson {
  const path = normalizePath(json.path, basePath);

  return {
    ...json,
    path,
  };
}

function normalizePath(path: string, baseDir: string): string {
  if (path.startsWith(".")) {
    const resolved = resolve(baseDir, path);

    return resolved;
  }

  return path;
}

class Manifest {
  constructor(private json: ManifestJson) {
  }

  entries(): Entry[] {
    return this.json.assets.map((assetJson) => {
      return {
        mediaType: assetJson["media-type"],
        entrypoint: assetJson.entrypoint,
        path: assetJson.path,
      };
    });
  }
}

interface ManifestJson {
  assets: AssetJson[];
}

interface AssetJson {
  "media-type": string;
  path: string;
  entrypoint: boolean;
}

interface Entry {
  path: string;
  mediaType: string;
  entrypoint: boolean;
}
