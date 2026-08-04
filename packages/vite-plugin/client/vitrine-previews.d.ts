/** virtual:vitrine-previews가 넘기는 프리뷰 엔트리 하나, scan.ts의 PreviewEntry에 load만 추가된 형태 */
interface GalleryPreviewEntry {
  id: string;
  name: string;
  file: string;
  exportName: string;
  load: () => Promise<Record<string, unknown>>;
}

declare module "virtual:vitrine-previews" {
  const entries: GalleryPreviewEntry[];
  export default entries;
}
