export const WEIGHT_UNIT_OPTIONS = ["500gm", "1kg", "2kg", "5kg", "10kg", "25kg"];
export const PACK_UNIT_OPTIONS = ["1pac", "4pac", "12pac"];
export const SINGLE_UNIT_OPTIONS = ["piece"];
export const UNIT_OPTIONS = [...SINGLE_UNIT_OPTIONS, ...WEIGHT_UNIT_OPTIONS, ...PACK_UNIT_OPTIONS];

export const getUnitOptions = (unit) => {
  if (unit && !UNIT_OPTIONS.includes(unit)) {
    return [unit, ...UNIT_OPTIONS];
  }
  return UNIT_OPTIONS;
};

export const getCustomerUnitOptions = (unit = "", variants = []) => {
  if (Array.isArray(variants) && variants.length > 0) {
    return variants;
  }

  const normalized = unit.toLowerCase().replace(/\s+/g, "");

  if (normalized.includes("kg") || normalized.includes("gm") || normalized.includes("g")) {
    return WEIGHT_UNIT_OPTIONS;
  }

  if (normalized.includes("pac") || normalized.includes("pack") || normalized.includes("packet")) {
    return PACK_UNIT_OPTIONS;
  }

  if (unit && !SINGLE_UNIT_OPTIONS.includes(unit)) {
    return [unit];
  }

  return SINGLE_UNIT_OPTIONS;
};
