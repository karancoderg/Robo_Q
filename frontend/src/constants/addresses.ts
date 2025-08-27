// IIT Mandi North Campus Addresses

export interface Address {
  id: string;
  name: string;
  category: 'hostels' | 'academic' | 'guest_house' | 'mess';
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const IIT_MANDI_ADDRESSES: Address[] = [
  // Hostels
  {
    id: 'hostel_b10',
    name: 'B10 Hostel',
    category: 'hostels',
    fullAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7754, lng: 77.0269 }
  },
  {
    id: 'hostel_b12',
    name: 'B12 Hostel',
    category: 'hostels',
    fullAddress: 'B12 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7756, lng: 77.0271 }
  },
  {
    id: 'hostel_b15',
    name: 'B15 Hostel',
    category: 'hostels',
    fullAddress: 'B15 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7758, lng: 77.0273 }
  },
  {
    id: 'hostel_b8',
    name: 'B8 Hostel',
    category: 'hostels',
    fullAddress: 'B8 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7752, lng: 77.0267 }
  },
  {
    id: 'hostel_b9',
    name: 'B9 Hostel',
    category: 'hostels',
    fullAddress: 'B9 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7753, lng: 77.0268 }
  },

  // Academic Areas
  {
    id: 'academic_a13',
    name: 'A13 Academic Block',
    category: 'academic',
    fullAddress: 'A13 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7760, lng: 77.0275 }
  },
  {
    id: 'academic_a11',
    name: 'A11 Academic Block',
    category: 'academic',
    fullAddress: 'A11 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7762, lng: 77.0277 }
  },
  {
    id: 'academic_a17',
    name: 'A17 Academic Block',
    category: 'academic',
    fullAddress: 'A17 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7764, lng: 77.0279 }
  },
  {
    id: 'academic_auditorium',
    name: 'Auditorium',
    category: 'academic',
    fullAddress: 'Auditorium, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7766, lng: 77.0281 }
  },
  {
    id: 'academic_a14',
    name: 'A14 Academic Block',
    category: 'academic',
    fullAddress: 'A14 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7768, lng: 77.0283 }
  },
  {
    id: 'academic_library',
    name: 'Library',
    category: 'academic',
    fullAddress: 'Library, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7770, lng: 77.0285 }
  },

  // Guest House
  {
    id: 'guest_cv_raman',
    name: 'CV Raman Guest House',
    category: 'guest_house',
    fullAddress: 'CV Raman Guest House, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7772, lng: 77.0287 }
  },

  // Mess
  {
    id: 'mess_pine',
    name: 'Pine Mess',
    category: 'mess',
    fullAddress: 'Pine Mess, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7774, lng: 77.0289 }
  },
  {
    id: 'mess_alder',
    name: 'Alder Mess',
    category: 'mess',
    fullAddress: 'Alder Mess, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7776, lng: 77.0291 }
  },
  {
    id: 'mess_tulsi',
    name: 'Tulsi Mess',
    category: 'mess',
    fullAddress: 'Tulsi Mess, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7778, lng: 77.0293 }
  },
  {
    id: 'mess_peepal',
    name: 'Peepal Mess',
    category: 'mess',
    fullAddress: 'Peepal Mess, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7780, lng: 77.0295 }
  },
  {
    id: 'mess_oak',
    name: 'Oak Mess',
    category: 'mess',
    fullAddress: 'Oak Mess, IIT Mandi North Campus, Kamand, HP 175005',
    coordinates: { lat: 31.7782, lng: 77.0297 }
  }
];

export const ADDRESS_CATEGORIES = {
  hostels: 'Hostels',
  academic: 'Academic Areas',
  guest_house: 'Guest House',
  mess: 'Mess'
} as const;

export const getAddressesByCategory = (category: keyof typeof ADDRESS_CATEGORIES) => {
  return IIT_MANDI_ADDRESSES.filter(addr => addr.category === category);
};

export const getAddressById = (id: string) => {
  return IIT_MANDI_ADDRESSES.find(addr => addr.id === id);
};

export const getAllAddresses = () => {
  return IIT_MANDI_ADDRESSES;
};
