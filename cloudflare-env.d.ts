interface CloudflareEnv extends Record<string, unknown> {
  BLOG_IMAGES: R2Bucket;
  ASSETS: Fetcher;
  WORKER_SELF_REFERENCE: Fetcher;
  IMAGES: ImagesBinding;
}
