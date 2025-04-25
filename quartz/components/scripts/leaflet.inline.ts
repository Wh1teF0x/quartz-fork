import { Control, DivIcon, Marker } from "leaflet"
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

type JsonMarker = {
  type: string
  iconName: string
  color: string
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
  window.L.imageOverlay(path, data.bounds, { pane: "base" }).addTo(map)
  const layerControl = window.L.control.layers().addTo(map)
  return { map, layerControl }
}

function initIcons(markers: Array<JsonMarker>): Record<string, DivIcon> {
  const icons: Record<string, DivIcon> = {}
  markers.forEach((marker) => {
    const icon = window.L.divIcon({
      html: `<i style="color: ${marker.color}" class="fa fa-${marker.iconName} fa-2x"></i>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: "divIcon",
    })
    icons[marker.type] = icon
  })
  return icons
}

function positionMarkers(
  map: L.Map,
  data: LeafletProps,
  icons: Record<string, DivIcon>,
  layerControl: Control.Layers,
  currentSlug: FullSlug,
  allSlugs: Array<FullSlug>,
) {
  window.L.layerGroup()
  const markersByType: Record<string, Array<Marker>> = {}
  for (let marker of data?.marker || []) {
    const [type, py, px, link] = marker.split(",")
    const absLink = transformLink(currentSlug, link, { strategy: "shortest", allSlugs: allSlugs })
    const options =
      type !== "default" && icons?.[type]
        ? {
            icon: icons[type],
          }
        : undefined
    const mk = window.L.marker([Number.parseInt(py, 10), Number.parseInt(px, 10)], options)
      .addTo(map)
      .bindPopup(`<a href=${absLink}>${link}</a>`)
    if (!markersByType?.[type]) {
      markersByType[type] = []
    }
    markersByType[type].push(mk)
  }
  Object.keys(markersByType).forEach((type) => {
    const layer = window.L.layerGroup(markersByType[type])
    console.log(type, layer)
    layerControl.addOverlay(layer, type)
  })
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

      const markers = JSON.parse(node.getAttribute("data-markers") as string)
      const jsonData = parseYaml<LeafletProps>(JSON.parse(data))

      const leafletContainer = document.createElement("div")
      leafletContainer.id = jsonData.id
      leafletContainer.style.height = jsonData.height

      const parent = node.parentElement as HTMLElement
      parent.innerHTML = ""
      parent.appendChild(leafletContainer)

      const { map, layerControl } = initMap(jsonData, currentSlug, allSlugs)
      const icons = initIcons(markers)
      positionMarkers(map, jsonData, icons, layerControl, currentSlug, allSlugs)
    }
  }

  await renderLeaflet()
})
