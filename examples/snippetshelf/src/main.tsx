import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { makeQueryClient } from "@/queryClient";
import { makeRouter } from "@/router";

const element = document.getElementById("root");
if (element === null) {
  throw new Error("index.html has no #root element");
}

const queryClient = makeQueryClient();
const router = makeRouter(queryClient);

createRoot(element).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
