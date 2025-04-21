let leafletImport = undefined;
document.addEventListener('nav', async () => {
  console.log('custom script');
  leafletImport ||= await import(
    // @ts-ignore
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  );
  const leaflet = leafletImport.default;
  const map = leaflet.map('map').setView([51.505, -0.09], 13);
  console.log(leaflet);
});
