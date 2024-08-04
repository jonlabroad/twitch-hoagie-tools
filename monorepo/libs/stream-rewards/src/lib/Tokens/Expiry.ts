interface ExpiryType {
  unit: string;
  value: number;
}

const expiryPerType: Record<string, ExpiryType> = {
  "sub": {
    unit: "month",
    value: 1,
  },
  "resub": {
    unit: "month",
    value: 1,
  },
  "subgift": {
    unit: "hours",
    value: 4,
  },
}

export function GenerateExpiryTimestamp(type: string): Date | null {
    const now = new Date();
    const expiryType = expiryPerType[type];
    if (!expiryType) {
      return null;
    }

    console.log({ now });
    if (expiryType.unit === "month") {
      return new Date(now.setMonth(now.getMonth() + expiryType.value));
    } else if (expiryType.unit === "hours") {
      return new Date(now.setHours(now.getHours() + expiryType.value));
    } else if (expiryType.unit === "minutes") {
      return new Date(now.setHours(now.getMinutes() + expiryType.value));
    } else {
      console.warn(`Unknown expiry unit: ${expiryType.unit}`);
      return null;
    }
}

