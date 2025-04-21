document.addEventListener('nav', async () => {
  const center = document.querySelector('.center') as HTMLElement;
  const nodes = center.querySelectorAll('code.leaflet') as NodeListOf<HTMLElement>;

  if (!nodes) return;

  const textMapping: WeakMap<HTMLElement, string> = new WeakMap();
  for (const node of nodes) {
    textMapping.set(node, node.innerText);
  }

  async function renderLeaflet() {
    // de-init any other diagrams
    // for (const node of nodes) {
    //   node.removeAttribute("data-processed")
    //   const oldText = textMapping.get(node)
    //   if (oldText) {
    //     node.innerHTML = oldText
    //   }
    // }
    // const computedStyleMap = cssVars.reduce(
    //   (acc, key) => {
    //     acc[key] = window.getComputedStyle(document.documentElement).getPropertyValue(key)
    //     return acc
    //   },
    //   {} as Record<(typeof cssVars)[number], string>,
    // )
    // const darkMode = document.documentElement.getAttribute("saved-theme") === "dark"
    // mermaid.initialize({
    //   startOnLoad: false,
    //   securityLevel: "loose",
    //   theme: darkMode ? "dark" : "base",
    //   themeVariables: {
    //     fontFamily: computedStyleMap["--codeFont"],
    //     primaryColor: computedStyleMap["--light"],
    //     primaryTextColor: computedStyleMap["--darkgray"],
    //     primaryBorderColor: computedStyleMap["--tertiary"],
    //     lineColor: computedStyleMap["--darkgray"],
    //     secondaryColor: computedStyleMap["--secondary"],
    //     tertiaryColor: computedStyleMap["--tertiary"],
    //     clusterBkg: computedStyleMap["--light"],
    //     edgeLabelBackground: computedStyleMap["--highlight"],
    //   },
    // })
    // await mermaid.run({ nodes })

    for (const node of nodes) {
      const data = node.getAttribute('data-clipboard') as string;
      if (!data) {
        return;
      }
      const formattedData = window.jsyaml.load(data) as string;
      const jsonData = window.jsyaml.load(formattedData) as Record<string, unknown>;
      const leafletContainer = document.createElement('div');
      leafletContainer.id = jsonData.id as string;
      leafletContainer.innerHTML = 'test';

      const parent = node.parentElement as HTMLElement;
      parent.innerHTML = '';
      parent.appendChild(leafletContainer);

      console.log(window.leaflet);
      //   leaflet.map(jsonData.id).setView([0, 0]);
      console.log('json data', jsonData);
    }
  }

  await renderLeaflet();
});
