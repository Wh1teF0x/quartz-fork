import { parseYaml } from "../../util/parseYaml"
import { FilePath, FullSlug, transformLink } from "../../util/path"

type LeafletProps = {
  id: string
  height: string
  image: FilePath
  bounds: [[number, number], [number, number]]
  defaultZoom?: number
  maxZoom?: number
  marker?: Array<string>
  minZoom?: number
  unit: string
}

function initMap(data: LeafletProps, currentSlug: FullSlug, allSlugs: Array<FullSlug>) {
  const path = transformLink(currentSlug, data.image, { strategy: "shortest", allSlugs: allSlugs })
  const posX = data.bounds[1][0] || 100
  const posY = data.bounds[1][1] || 100
  const map = window.L.map(data.id, {
    attributionControl: false,
    crs: window.L.CRS.Simple,
  }).setView([posX / 2, posY / 2], data.defaultZoom)
  map.createPane("base")
  const image = window.L.imageOverlay(
    path,
    [
      [0, 0],
      [100, 150],
    ],
    { pane: "base" },
  )
  image.addTo(map)
  return map
}

function positionMarkers(
  map: L.Map,
  data: LeafletProps,
  currentSlug: FullSlug,
  allSlugs: Array<FullSlug>,
) {
  for (let marker of data?.marker || []) {
    const [, py, px, link] = marker.split(",")
    const absLink = transformLink(currentSlug, link, { strategy: "shortest", allSlugs: allSlugs })
    window.L.marker([Number.parseInt(py, 10), Number.parseInt(px, 10)])
      .addTo(map)
      .bindPopup(`<a href=${absLink}>${link}</a>`)
  }
}

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  const allSlugs = Object.keys(await fetchData) as Array<FullSlug>
  const nodes = document.querySelectorAll(".center code.leaflet") as NodeListOf<HTMLElement>

  if (!nodes) return

  async function renderLeaflet() {
    for (const node of nodes) {
      const data = node.getAttribute("data-clipboard") as string
      if (!data) {
        return
      }

      const formattedData = JSON.parse(data)
      const jsonData = parseYaml<LeafletProps>(formattedData)

      const leafletContainer = document.createElement("div")
      leafletContainer.id = jsonData.id
      leafletContainer.style.height = jsonData.height

      const parent = node.parentElement as HTMLElement
      parent.innerHTML = ""
      parent.appendChild(leafletContainer)

      const map = initMap(jsonData, currentSlug, allSlugs)
      positionMarkers(map, jsonData, currentSlug, allSlugs)
    }
  }

  await renderLeaflet()
})
