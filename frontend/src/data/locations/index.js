import { indiaLocationData } from './india';
import { unitedStatesLocationData } from './unitedStates';
import { australiaLocationData } from './australia';
import { singaporeLocationData } from './singapore';
import { japanLocationData } from './japan';
import { unitedKingdomLocationData } from './unitedKingdom';

export const LOCATION_REGISTRY = {
  [indiaLocationData.country]: indiaLocationData,
  [unitedStatesLocationData.country]: unitedStatesLocationData,
  [australiaLocationData.country]: australiaLocationData,
  [singaporeLocationData.country]: singaporeLocationData,
  [japanLocationData.country]: japanLocationData,
  [unitedKingdomLocationData.country]: unitedKingdomLocationData,
};

// Re-export map format for backward compatibility with LOCATION_DATA
export const LOCATION_DATA = {
  [indiaLocationData.country]: indiaLocationData.divisions,
  [unitedStatesLocationData.country]: unitedStatesLocationData.divisions,
  [australiaLocationData.country]: australiaLocationData.divisions,
  [singaporeLocationData.country]: singaporeLocationData.divisions,
  [japanLocationData.country]: japanLocationData.divisions,
  [unitedKingdomLocationData.country]: unitedKingdomLocationData.divisions,
};

export const COUNTRY_META = {
  [indiaLocationData.country]: {
    countryCode: indiaLocationData.countryCode,
    adminLabel: indiaLocationData.administrativeLabel,
    localityLabel: indiaLocationData.localityLabel,
  },
  [unitedStatesLocationData.country]: {
    countryCode: unitedStatesLocationData.countryCode,
    adminLabel: unitedStatesLocationData.administrativeLabel,
    localityLabel: unitedStatesLocationData.localityLabel,
  },
  [australiaLocationData.country]: {
    countryCode: australiaLocationData.countryCode,
    adminLabel: australiaLocationData.administrativeLabel,
    localityLabel: australiaLocationData.localityLabel,
  },
  [singaporeLocationData.country]: {
    countryCode: singaporeLocationData.countryCode,
    adminLabel: singaporeLocationData.administrativeLabel,
    localityLabel: singaporeLocationData.localityLabel,
  },
  [japanLocationData.country]: {
    countryCode: japanLocationData.countryCode,
    adminLabel: japanLocationData.administrativeLabel,
    localityLabel: japanLocationData.localityLabel,
  },
  [unitedKingdomLocationData.country]: {
    countryCode: unitedKingdomLocationData.countryCode,
    adminLabel: unitedKingdomLocationData.administrativeLabel,
    localityLabel: unitedKingdomLocationData.localityLabel,
  },
};
