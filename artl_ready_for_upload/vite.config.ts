import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["5174-ir34uc56zrvxumi83rlgs-f2a02ec0.manus.computer", "5175-ir34uc56zrvxumi83rlgs-f2a02ec0.manus.computer", "5176-ir34uc56zrvxumi83rlgs-f2a02ec0.manus.computer", "5173-ibeemsydou4sw8rj6pk0p-f2a02ec0.manus.computer", "5174-i7812eot8kjc6rj9j5z4u-f2a02ec0.manus.computer", "5175-i7812eot8kjc6rj9j5z4u-f2a02ec0.manus.computer", "5173-im4acjgo6qy9b2icobuld-8b9e17db.manus.computer", "5173-i57igmvqxrit0n63nemhm-8b9e17db.manus.computer"]
  }
})

