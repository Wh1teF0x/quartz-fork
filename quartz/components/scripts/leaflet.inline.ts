import { parseYaml } from '../../util/parseYaml';
import { FilePath, slugifyFilePath } from '../../util/path';

type LeafletProps = {
  id: string;
  height: string;
  image: FilePath;
  bounds: [[number, number], [number, number]];
  defaultZoom?: number;
  maxZoom?: number;
  marker?: Array<string>;
  minZoom?: number;
  unit: string;
};

document.addEventListener('nav', async () => {
  const center = document.querySelector('.center') as HTMLElement;
  const nodes = center.querySelectorAll('code.leaflet') as NodeListOf<HTMLElement>;

  if (!nodes) return;

  const textMapping: WeakMap<HTMLElement, string> = new WeakMap();
  for (const node of nodes) {
    textMapping.set(node, node.innerText);
  }

  async function renderLeaflet() {
    for (const node of nodes) {
      const data = node.getAttribute('data-clipboard') as string;
      if (!data) {
        return;
      }

      const formattedData = window.jsyaml.load(data) as string;
      const jsonData = parseYaml<LeafletProps>(formattedData);
      console.log('json data', jsonData);

      const leafletContainer = document.createElement('div');
      leafletContainer.id = jsonData.id;
      leafletContainer.style.height = jsonData.height;

      const parent = node.parentElement?.parentElement as HTMLElement;
      parent.innerHTML = '';
      parent.appendChild(leafletContainer);

      const path = slugifyFilePath(jsonData.image);
      const posX = jsonData.bounds[1][0] || 100;
      const posY = jsonData.bounds[1][1] || 100;
      const map = window.L.map(jsonData.id, { attributionControl: false }).setView(
        [posX / 2, posY / 2],
        jsonData.defaultZoom,
      );
      map.createPane('base');
      const image = window.L.imageOverlay(path, jsonData.bounds, { pane: 'base' });
      image.addTo(map);

      for (let marker of jsonData?.marker || []) {
        const [, px, py, link] = marker.split(',');
        window.L.marker([Number.parseInt(px, 10), Number.parseInt(py, 10)])
          .addTo(map)
          .bindPopup(`<a href=${link}>${link}</a>`);
      }
      // TODO:
      // объединить репы
      // правильные ссылки
      // ставить метки
      // gitignore
    }
  }

  await renderLeaflet();
});
