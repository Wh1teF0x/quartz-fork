import { parseYaml } from '../../util/parseYaml';
import { FilePath, slugifyFilePath } from '../../util/path';

type LeafletProps = {
  id: string;
  height: string;
  image: FilePath;
  bounds: L.LatLngBoundsExpression;
  defaultZoom?: number;
  maxZoom?: number;
  marker?: Array<string>;
  minZoom?: number;
  unit: string;
};

function addImageProcess(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = function () {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = src;
  });
}

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
      const leafletContainer = document.createElement('div');
      leafletContainer.id = jsonData.id;
      leafletContainer.style.height = jsonData.height;

      const parent = node.parentElement?.parentElement as HTMLElement;
      parent.innerHTML = '';
      parent.appendChild(leafletContainer);

      const map = window.L.map(jsonData.id, { attributionControl: false, ...jsonData }).setView(
        [0, 0],
        jsonData.defaultZoom,
      );
      const path = slugifyFilePath(jsonData.image);
      const { width, height } = await addImageProcess(path);
      const posX = 100;
      const posY = (100 * width) / height;
      const image = window.L.imageOverlay(path, [
        [-posX / 2, -posY / 2],
        [posX / 2, posY / 2],
      ]);
      image.addTo(map);
      console.log('json data', jsonData);

      for (let marker of jsonData?.marker || []) {
        const [type, px, py, link] = marker.split(',');
        console.log(type, px, py, link);
        const m = window.L.marker([Number.parseInt(px, 10), Number.parseInt(py, 10)]).addTo(map);
        m.on('click', () => window.spaNavigate(link));
      }
      // TODO:
      // объеденить репы
      // правильные ссылки
      // ставить метки
      // gitignore
    }
  }

  await renderLeaflet();
});
