// Static-site API: every endpoint is a GET exported at build time to api/<path>.json (see scripts/build_static.py).
export async function staticApi(path, body) {
  if (body) throw new Error('This action needs the local Python app.');
  const name = path.replace(/^\//, '').split('?')[0];
  const r = await fetch(`api/${name}.json`);
  if (!r.ok) throw new Error(`${r.status} api/${name}.json`);
  return r.json();
}
