export type Category = 'CAMERA_BODY' | 'LENS' | 'LIGHTING' | 'AUDIO' | 'DRONE' | 'ACCESSORY'
export type Condition = 'EXCELLENT' | 'GOOD' | 'FAIR'

export interface ListingImage {
  id: string
  imageUrl: string
  displayOrder: number
}

export interface ListingOwner {
  id: string
  firstName: string
  lastName?: string
  avatarUrl?: string
  idVerified: boolean
  averageRating?: number
  totalReviews?: number
}

export interface Listing {
  id: string
  title: string
  description: string
  category: Category
  pricePerDay: number
  depositAmount: number
  condition: Condition
  brand?: string
  model?: string
  pickupLocation: string
  available: boolean
  images: ListingImage[]
  owner: ListingOwner
  createdAt: string
}

export interface ListingSummary {
  id: string
  title: string
  category: Category
  pricePerDay: number
  depositAmount: number
  condition: Condition
  pickupLocation: string
  available: boolean
  primaryImage?: string
  owner: {
    id: string
    firstName: string
    idVerified: boolean
    averageRating?: number
  }
}

export interface CreateListingRequest {
  title: string
  description: string
  category: Category
  pricePerDay: number
  depositAmount: number
  condition: Condition
  brand?: string
  model?: string
  pickupLocation: string
  imageUrls?: string[]
}

export interface UpdateListingRequest {
  title?: string
  description?: string
  category?: Category
  pricePerDay?: number
  depositAmount?: number
  condition?: Condition
  brand?: string
  model?: string
  pickupLocation?: string
  available?: boolean
  imageUrls?: string[]
}

export const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Cameras', value: 'CAMERA_BODY' },
  { label: 'Lenses', value: 'LENS' },
  { label: 'Lighting', value: 'LIGHTING' },
  { label: 'Audio', value: 'AUDIO' },
  { label: 'Drones', value: 'DRONE' },
  { label: 'Accessories', value: 'ACCESSORY' },
]

export const CONDITIONS: { label: string; value: Condition; description: string }[] = [
  { label: 'Excellent', value: 'EXCELLENT', description: 'Like new, minimal signs of use' },
  { label: 'Good', value: 'GOOD', description: 'Normal wear, fully functional' },
  { label: 'Fair', value: 'FAIR', description: 'Visible wear, works perfectly' },
]
