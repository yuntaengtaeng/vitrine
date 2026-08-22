/** virtual:vitrine-previews가 넘기는 Gallery 프리뷰 entry */
type GalleryPreviewEntry = Pick<
  import("@vitrine/protocol").ManifestEntry,
  "id" | "name" | "group" | "file" | "exportName" | "controls"
> & {
  load: () => Promise<Record<string, unknown>>;
};

/** Gallery control component가 소비하는 prop control */
type GalleryPropControl = import("@vitrine/protocol").PropControl;

declare module "virtual:vitrine-previews" {
  const entries: GalleryPreviewEntry[];
  export default entries;
}
