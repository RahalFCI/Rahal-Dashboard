// Curated, real photographs for the well-known Egyptian landmarks seeded into
// this admin tool's database. Admin-created places rarely have an uploaded
// photo yet (see PlaceThumbnail), so the rich list/grid cards fall back to a
// specific, real photo of the actual destination instead of a generic icon.
// Sourced from Wikimedia Commons (Special:FilePath resolves to the current
// upload regardless of internal storage path/hash).
const COMMONS_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

function commons(fileName: string): string {
  return `${COMMONS_BASE}${encodeURIComponent(fileName)}`;
}

// Exact match by place name (case-insensitive).
const PHOTO_BY_PLACE_NAME: Record<string, string> = {
  'great pyramid of giza': commons('Great_Pyramid_of_Giza.jpg'),
  'citadel of saladin': commons('Citadel_of_Saladin_in_Cairo.jpg'),
  'egyptian museum': commons('Cairo_Egyptian_Museum3.JPG'),
  'karnak temple complex': commons('Great_Hall_of_Columns_at_Karnak.jpg'),
  'valley of the kings': commons('Luxor_Valley_of_the_Kings_R01.jpg'),
  'abu simbel temples': commons('Abu_Simbel_Great_Temple.jpg'),
  'philae temple': commons('The_Philae_temple_complex.jpg'),
  'khan el-khalili bazaar': commons('The_Khan_el-Khalili_market_in_Cairo,_Egypt_(2743501345).jpg'),
  'luxor temple': commons('Pylons_and_obelisk_Luxor_temple.JPG'),
  'alexandria library': commons('Bibliotheca_Alexandria_and_the_sky.jpg'),
  'siwa oasis': commons('Desert_dunes_near_Siwa,_Egypt_(2007-05-117)_(869648897).jpg'),
  'white desert': commons('White_Desert,_Rock_formations,_Egypt.jpg'),
  'mount sinai': commons('Lever_de_soleil_Mont_Sinaï_Egypte_-_Sunrise_Mount_Sinai_Egypt_-_Photo_image_picture_(12859772904).jpg'),
  'saint catherine monastery': commons("Saint_Catherine's_Monastery,_Mount_Sinai_morning.jpg"),
  'al-azhar mosque': commons('Cairo_-_Islamic_district_-_Al_Azhar_Mosque_and_University.JPG'),
  'colossi of memnon': commons('Colossi_of_Memnon_R01.jpg'),
  'wadi el rayan': commons('Waterfalls_of_Wadi_El_Rayan,_Fayoum,_Egypt.jpg'),
  'deir el-bahari': commons('Thebes,_Luxor,_Egypt,_Temple_of_Hatshepsut,_Deir_el-Bahari.jpg'),
  'nubian museum': commons('Aswan_Nubian_Museum_entrance.jpg'),
  'coptic cairo': commons('Cairo,_Old_Cairo,_Hanging_Church,_Egypt,_Oct_2004_edit.jpg'),
  'ras mohamed national park': commons('Coral_reef_in_Ras_Muhammad_nature_park.JPG'),
};

// Fallback by category name (case-insensitive) for places without a specific
// curated photo (e.g. newly admin-created entries).
const PHOTO_BY_CATEGORY_NAME: Record<string, string> = {
  'archaeological sites': commons('Great_Pyramid_of_Giza.jpg'),
  museums: commons('Cairo_Egyptian_Museum3.JPG'),
  'natural wonders': commons('White_Desert,_Rock_formations,_Egypt.jpg'),
  'religious sites': commons('Cairo,_Old_Cairo,_Hanging_Church,_Egypt,_Oct_2004_edit.jpg'),
  'urban & cultural': commons('The_Khan_el-Khalili_market_in_Cairo,_Egypt_(2743501345).jpg'),
  beaches: commons('Hurghada_Hilton_Resort_Beach_Red_Sea_-_panoramio.jpg'),
};

const DEFAULT_PHOTO = commons('Great_Pyramid_of_Giza.jpg');

export function getCuratedPlacePhoto(placeName: string, categoryName?: string): string {
  const byName = PHOTO_BY_PLACE_NAME[placeName.trim().toLowerCase()];
  if (byName) return byName;

  const byCategory = categoryName ? PHOTO_BY_CATEGORY_NAME[categoryName.trim().toLowerCase()] : undefined;
  if (byCategory) return byCategory;

  return DEFAULT_PHOTO;
}
