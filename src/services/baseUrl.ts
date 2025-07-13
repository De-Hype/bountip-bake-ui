export type BaseUrlProdType = "local" | "live";

const getBaseUrl = (env: BaseUrlProdType): string =>
  env === "live" ? "https://seal-app-wzqhf.ondigitalocean.app/api/v1" : "http://localhost:8080/api/v1";

export default getBaseUrl;




