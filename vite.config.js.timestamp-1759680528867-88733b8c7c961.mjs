// vite.config.js
import path from "node:path";
import react from "file:///E:/Anirban%20Full%20backend/final/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///E:/Anirban%20Full%20backend/final/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///E:/Anirban%20Full%20backend/final/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { createHtmlPlugin } from "file:///E:/Anirban%20Full%20backend/final/node_modules/vite-plugin-html/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\Anirban Full backend\\final";
var vite_config_default = defineConfig({
  plugins: [react(), createHtmlPlugin({
    inject: {
      data: {
        title: "ANIRBAN'S ACADEMY"
      }
    }
  }), visualizer({ open: false, gzipSize: true, brotliSize: true })],
  server: {
    cors: true,
    allowedHosts: true
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxBbmlyYmFuIEZ1bGwgYmFja2VuZFxcXFxmaW5hbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcQW5pcmJhbiBGdWxsIGJhY2tlbmRcXFxcZmluYWxcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0FuaXJiYW4lMjBGdWxsJTIwYmFja2VuZC9maW5hbC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLWh0bWwnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbcmVhY3QoKSwgY3JlYXRlSHRtbFBsdWdpbih7XG4gICAgICBpbmplY3Q6IHtcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHRpdGxlOiBcIkFOSVJCQU4nUyBBQ0FERU1ZXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLCB2aXN1YWxpemVyKHsgb3BlbjogZmFsc2UsIGd6aXBTaXplOiB0cnVlLCBicm90bGlTaXplOiB0cnVlIH0pXSxcblx0c2VydmVyOiB7XG5cdFx0Y29yczogdHJ1ZSxcblx0XHRhbGxvd2VkSG9zdHM6IHRydWUsXG5cdH0sXG5cdHJlc29sdmU6IHtcblx0XHRleHRlbnNpb25zOiBbJy5qc3gnLCAnLmpzJywgJy50c3gnLCAnLnRzJywgJy5qc29uJ10sXG5cdFx0YWxpYXM6IHtcblx0XHRcdCdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG5cdFx0fSxcblx0fSxcbn0pO1xuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1SLE9BQU8sVUFBVTtBQUNwUyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyx3QkFBd0I7QUFKakMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUyxDQUFDLE1BQU0sR0FBRyxpQkFBaUI7QUFBQSxJQUMvQixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsUUFDSixPQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUMsR0FBRyxXQUFXLEVBQUUsTUFBTSxPQUFPLFVBQVUsTUFBTSxZQUFZLEtBQUssQ0FBQyxDQUFDO0FBQUEsRUFDcEUsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLEVBQ2Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLFlBQVksQ0FBQyxRQUFRLE9BQU8sUUFBUSxPQUFPLE9BQU87QUFBQSxJQUNsRCxPQUFPO0FBQUEsTUFDTixLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDckM7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
