/** virtual:vitrine-previews가 넘기는 프리뷰 엔트리 하나, scan.ts의 PreviewEntry에 load만 추가된 형태 */
interface GalleryPreviewEntry {
  id: string;
  name: string;
  group?: string;
  file: string;
  exportName: string;
  controls: Record<string, GalleryPropControl>;
  load: () => Promise<Record<string, unknown>>;
}

interface GalleryPropControl {
  type: "text" | "number" | "boolean" | "select";
  options?: Array<string | number>;
  optional: boolean;
  defaultValue?: string | number | boolean;
}

declare module "virtual:vitrine-previews" {
  const entries: GalleryPreviewEntry[];
  export default entries;
}
