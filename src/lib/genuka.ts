import Genuka from "genuka";

let genukaInstance: Genuka | null = null;

interface InitializeProps {
  token?: string;
  companyId?: string;
}

export async function initializeGenuka({ token, companyId }: InitializeProps) {
  if (!genukaInstance) {
    // Initialize with domain if provided
    genukaInstance = await Genuka.initialize({ companyId });
  }

  if (!genukaInstance) {
    return null;
  }

  // Set token if provided
  if (token) {
    genukaInstance.setToken(token);
  }

  // Set company ID if provided, otherwise it will be set by domain
  if (companyId) {
    genukaInstance.setCompanyId(companyId);
  }
  return genukaInstance;
}

export function getGenukaInstance(): Genuka {
  if (!genukaInstance) {
    throw new Error("Genuka not initialized");
  }
  return genukaInstance;
}
