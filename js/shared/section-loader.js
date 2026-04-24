export async function loadSectionIncludes() {
  const placeholders = Array.from(document.querySelectorAll('[data-include]'));
  if (!placeholders.length) return;

  await Promise.all(placeholders.map(async (placeholder) => {
    const source = placeholder.dataset.include;
    if (!source) return;

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Unable to load ${source}: ${response.status}`);

      placeholder.outerHTML = await response.text();
    } catch (error) {
      console.error(error);
      placeholder.innerHTML = '<section class="section framed-section"><p>Section failed to load.</p></section>';
    }
  }));
}
