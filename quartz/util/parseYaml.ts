import YAML from 'yaml';

export function parseYaml<T extends Record<string, unknown>>(yamlText: string): T {
  const doc = YAML.parseDocument(yamlText, { uniqueKeys: false }) as any;
  const result: Record<string, unknown> = {};

  for (const pair of doc.contents.items) {
    const key = pair.key.value;
    const value = pair.value.value;

    if (result.hasOwnProperty(key)) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
